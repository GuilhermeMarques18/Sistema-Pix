# Histórico de Transações PIX

## 1. Objetivo

Documentar a implementação da funcionalidade de histórico de transações PIX, incluindo seu comportamento, endpoint disponibilizado, contrato da API e informações necessárias para integração, validação e manutenção da funcionalidade.

---

## 2. Descrição da funcionalidade

A funcionalidade permite consultar as movimentações PIX relacionadas ao usuário autenticado para visualização do histórico de transações.

As transações são persistidas no banco de dados durante a realização de uma transferência PIX. Dessa forma, não existe uma operação separada para adicionar uma transação ao histórico.

O histórico apenas consulta as transações já registradas no sistema.

---

## 3. Endpoint

### Consultar histórico de transações

```http
GET /api/pix/transactions/history
```

Retorna as transações PIX relacionadas à conta do usuário autenticado.

---

## 4. Autenticação

O endpoint exige autenticação.

O token JWT deve ser enviado no header:

```http
Authorization: Bearer <token>
```

---

## 5. Parâmetros

O endpoint de histórico não recebe parâmetros.

O filtro das transações por data será tratado em uma funcionalidade específica.

---

## 6. Body da requisição

Não possui body.

Exemplo:

```http
GET /api/pix/transactions/history
Authorization: Bearer <token>
```

---

## 7. Resposta de sucesso

### Status HTTP

```http
200 OK
```

### Exemplo

```json
{
  "periodoInicio": "1970-01-01T00:00:00",
  "periodoFim": "2026-09-21T23:59:59",
  "totalEntradas": 150.00,
  "totalSaidas": 75.50,
  "transacoes": [
    {
      "idTransacao": "a986f76b-6647-4f5c-8cf4-52b59d7564e4",
      "dataHora": "2026-09-21T14:30:00",
      "tipo": "SAIDA",
      "valor": 75.50,
      "descricao": "Pagamento",
      "contaContraparteId": "4ab8b951-06ac-468c-b52f-06373416cb6c"
    }
  ]
}
```

---

## 8. Contrato da resposta

### Objeto principal

| Campo           | Tipo     | Descrição                                   |
| --------------- | -------- | ------------------------------------------- |
| `periodoInicio` | DateTime | Início do período considerado pela consulta |
| `periodoFim`    | DateTime | Fim do período considerado pela consulta    |
| `totalEntradas` | Decimal  | Soma dos valores recebidos                  |
| `totalSaidas`   | Decimal  | Soma dos valores enviados                   |
| `transacoes`    | Array    | Lista de transações encontradas             |

### Transação

| Campo                | Tipo     | Descrição                              |
| -------------------- | -------- | -------------------------------------- |
| `idTransacao`        | UUID     | Identificador único da transação       |
| `dataHora`           | DateTime | Data e hora da transação               |
| `tipo`               | String   | Indica `ENTRADA` ou `SAIDA`            |
| `valor`              | Decimal  | Valor movimentado                      |
| `descricao`          | String   | Descrição da transação                 |
| `contaContraparteId` | UUID     | Identificador da outra conta envolvida |

---

## 9. Identificação da movimentação

O campo `tipo` representa a movimentação do ponto de vista do usuário autenticado.

* `ENTRADA`: o usuário recebeu um PIX.
* `SAIDA`: o usuário enviou um PIX.

Isso permite que a interfa
