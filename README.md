# Sistema-Pix / Branch da criação da conta bancária
Sistema em Java simulando funcionalidades do PIX com POO, desenvolvido para a disciplina de Gerência de Configuração (UFC Quixadá).
## 💰 Contas Bancárias (Bank Account)

### Requisitos / aceites
- Cada usuário possui **no máximo uma conta bancária**, vinculada por `userId` (relação 1:1), ou o cpf (não sei viu |Ryan como vcs organizaram o bd)
- O número da conta é gerado automaticamente pelo sistema (8 dígitos, único).
- A agência é fixa: `0001`, vamos lidar com um banco digital
- O saldo inicial de toda conta criada é `0.00`.
- Chave Pix **não faz parte** desta entidade — será tratada em outra feature do Ryan.

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/accounts` | Cria uma conta bancária para um usuário existente |
| GET | `/accounts/{id}` | Busca uma conta pelo seu ID |
| GET | `/accounts/user/{userId}` | Busca a conta vinculada a um usuário |

### Exemplo de requisição (POST /accounts)

```json
{
  "userId": "b3f1c2a0-1234-4a5b-9c8d-abcdef123456"
}
```

### Exemplos

```json
{
  "id": "e4a2f9d0-9876-4b5c-8a1e-fedcba654321",
  "accountNumber": "00482913",
  "agency": "0001",
  "balance": 0.00,
  "userId": "b3f1c2a0-1234-4a5b-9c8d-abcdef123456",
  "ownerName": "João da Silva",
  "createdAccount": "2026-08-28T19:30:00"
}
```

### Erros possíveis (peguei de outros códigos meus)
- `404 Not Found` — usuário informado não existe.
- `409 Conflict` (ou equivalente) — usuário já possui uma conta cadastrada.