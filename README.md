# Pix Agendado (`feat/scheduled-pix`)

Implementação do fluxo de **Pix Agendado** no projeto `sistem-pix`, contemplando persistência por meio de migração de banco de dados, agendamento com validação de senha, idempotência e data futura, execução assíncrona em background e integração com o fluxo de envio de Pix no frontend.

## 📚 Documentação da API (Swagger / OpenAPI)

Com o backend em execução local, acesse a documentação da API:

- **Swagger UI:** `http://localhost:8080/swagger-ui.html`  
  *(ou `http://localhost:8080/swagger-ui/index.html`, conforme a configuração do SpringDoc no projeto).*
- **OpenAPI JSON:** `http://localhost:8080/v3/api-docs`

---

## 🧪 Como testar o fluxo de Pix Agendado

> [!IMPORTANT]
> O agendamento utiliza o endpoint dedicado `POST /api/pix/scheduled-transactions`, e não o endpoint de Pix imediato.
>
> A requisição exige autenticação JWT, senha da conta e um campo `scheduledAt` com data e horário futuros.

### 1. Autenticação (Remetente)

Realize o login com a conta de origem:

**Endpoint:** `POST /api/auth/login`

```http
POST /api/auth/login
Content-Type: application/json
```

**Body:**

```json
{
  "email": "remetente@email.com",
  "password": "senha-da-conta"
}
```

Guarde o `token` retornado para utilizá-lo no cabeçalho de autorização das próximas requisições:

```http
Authorization: Bearer <token>
```

### 2. Resolver conta do destinatário

Com o token do remetente, consulte a chave Pix do destinatário.

A chave deve estar cadastrada e não pode pertencer à própria conta de origem.

**Endpoint:** `GET /api/pix/recipients/resolve`

```http
GET /api/pix/recipients/resolve?tipo=EMAIL&chave=destino%40email.com
Authorization: Bearer <token>
```

Utilize o `contaDestinoId` retornado na resposta para criar o agendamento.

### 3. Criar o agendamento de Pix

**Endpoint:** `POST /api/pix/scheduled-transactions`

```http
POST /api/pix/scheduled-transactions
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "chavePix": "destino@email.com",
  "valor": 10.00,
  "descricao": "Teste de Pix agendado",
  "tipoChave": "EMAIL",
  "contaDestinoId": "UUID-RETORNADO-PELA-CONSULTA-DO-DESTINATARIO",
  "password": "senha-da-conta",
  "idempotencyKey": "7ca6c8c0-849c-4a2d-b95b-536cae56ff64",
  "scheduledAt": "2026-12-01T10:00:00-03:00"
}
```

**Observações:**

- Ajuste `scheduledAt` para uma data e horário futuros no momento do teste.
- Utilize um novo UUID em `idempotencyKey` para cada novo agendamento.
- Repetir a mesma chave de idempotência com os mesmos dados retorna o registro existente, evitando duplicidade de agendamentos.

### 4. Acompanhar execução e transação

Após criar o agendamento, utilize o `id` retornado para consultar seu status.

**Endpoint:** `GET /api/pix/scheduled-transactions/{id}`

```http
GET /api/pix/scheduled-transactions/{id}
Authorization: Bearer <token>
```

**Fluxo de execução:**

1. Inicialmente, o agendamento recebe o status `PENDING`.
2. Após atingir a data e o horário programados, o executor verifica os agendamentos vencidos e inicia sua execução.
3. O executor realiza essa verificação a cada **10 segundos**, por padrão.
4. Após a tentativa de execução, o status é atualizado para `COMPLETED` ou `FAILED`.

**Pré-requisitos para a conclusão com sucesso:**

- Conta de origem habilitada.
- Saldo disponível suficiente.
- Limite Pix suficiente para realizar a transferência.

Quando o agendamento atingir o status `COMPLETED`, utilize o `transactionId` retornado para consultar os detalhes da transação.

**Endpoint:** `GET /api/pix/transactions/{transactionId}`

```http
GET /api/pix/transactions/{transactionId}
Authorization: Bearer <token>
```

---

## 📌 Resumo dos endpoints

| Método | Endpoint | Descrição |
|:---:|---|---|
| `POST` | `/api/auth/login` | Autenticação do remetente |

## Contatos PIX

Contatos PIX são privados por usuário autenticado. Cada contato armazena nome/apelido, tipo e valor da chave; chaves são normalizadas e não podem ser repetidas entre os contatos do mesmo usuário.

| Método | Endpoint | Descrição |
|:---:|---|---|
| `GET` | `/api/pix/contacts` | Lista os contatos do usuário autenticado |
| `POST` | `/api/pix/contacts` | Cria um contato |
| `PUT` | `/api/pix/contacts/{id}` | Atualiza um contato próprio |
| `DELETE` | `/api/pix/contacts/{id}` | Remove um contato próprio |

Exemplo de criação:

```json
{
  "nome": "Maria",
  "tipoChave": "EMAIL",
  "chavePix": "maria@example.com"
}
```

Use a seção **Contatos PIX** para gerenciar contatos. Na etapa de informar a chave ao enviar ou agendar um Pix, selecione um contato salvo para preencher o tipo e o valor da chave automaticamente.

## Histórico de acessos e localização PIX

Os endpoints abaixo retornam somente eventos do usuário autenticado. `page` é baseada em zero, `size` aceita até 100 registros, e `eventType`, `from` e `until` são filtros opcionais (`from`/`until` no formato `YYYY-MM-DD`).

| Método | Endpoint | Descrição |
|:---:|---|---|
| `GET` | `/api/audit/logins` | Consulta logins com status, IP e dispositivo |
| `GET` | `/api/audit/activities` | Consulta alterações e operações PIX |

O envio e o agendamento de Pix aceitam `location` opcional com `latitude`, `longitude`, `accuracyMeters` e `source: "BROWSER"`. A ausência de localização não impede a operação. Quando salva, ela é retornada no campo `location` do detalhe e do histórico de transações.

## Notificações de Pix por e-mail

Após uma transferência Pix ser confirmada, remetente e destinatário recebem, cada um, um e-mail de notificação se tiverem escolhido **E-mail** em **Ajustes → Notificações de PIX**. Transferências agendadas também usam esse fluxo quando são executadas.

Configure o SMTP do Gmail no `.env` (ou como variáveis de ambiente no deploy):

```dotenv
MAIL_USERNAME=seu-endereco@gmail.com
MAIL_PASSWORD=sua-senha-de-aplicativo-do-gmail
```

Para contas com autenticação em duas etapas, use uma senha de app do Gmail, não a senha normal da conta. Sem `MAIL_USERNAME` e `MAIL_PASSWORD`, a aplicação inicia normalmente, mas registra que não pode enviar e-mails.
