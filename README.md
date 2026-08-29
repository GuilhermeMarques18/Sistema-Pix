# Sistema-Pix / Branch de Conta Bancária

Sistema em Java simulando funcionalidades do PIX, desenvolvido para a disciplina de Gerência de Configuração (UFC Quixadá).

## 💰 Contas Bancárias

### Requisitos

* Cada usuário pode possuir no máximo uma conta bancária, vinculada pelo `userId`.
* O número da conta é gerado automaticamente com 8 dígitos.
* A agência é fixa: `0001`.
* O saldo inicial é `0.00`.
* O limite de transações inicia em `0.00` e pode ser atualizado.
* A remoção da conta é lógica: a conta passa a ter `ativo = false`.
* Chaves PIX serão tratadas separadamente em outra branch.

### Endpoints

| Método | Rota                      | Descrição                       |
| ------ | ------------------------- | ------------------------------- |
| POST   | `/accounts`               | Cria uma conta                  |
| GET    | `/accounts/{id}`          | Busca uma conta pelo ID         |
| GET    | `/accounts/user/{userId}` | Busca a conta de um usuário     |
| PATCH  | `/accounts/{id}`          | Atualiza o limite de transações |
| DELETE | `/accounts/{id}`          | Remove uma conta                |

### Criar conta

`POST /accounts`

```json
{
  "userId": "b3f1c2a0-1234-4a5b-9c8d-abcdef123456"
}
```

### Atualizar limite de transações

`PATCH /accounts/{id}`

```json
{
  "transactionLimit": 1500.00
}
```

O limite não pode ser negativo.

### Remover conta

`DELETE /accounts/{id}`

A remoção é lógica. A conta recebe `ativo = false` e a data da remoção é armazenada em `deletedAt`.

### Possíveis erros

* `404 Not Found` — usuário ou conta não encontrada.
* `409 Conflict` — usuário já possui uma conta.
* `400 Bad Request` — dados enviados são inválidos.
