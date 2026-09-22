# Filtro de Transações por Data

## Objetivo

Permitir que o usuário filtre o histórico de transações Pix por período.

## Endpoint

```http
GET /api/pix/transactions/history
```

O endpoint exige autenticação via token JWT.

## Filtros disponíveis

### Últimos dias

O parâmetro `ultimosDias` permite buscar as transações de um período recente.

Exemplos:

```http
GET /api/pix/transactions/history?ultimosDias=7
```

```http
GET /api/pix/transactions/history?ultimosDias=30
```

```http
GET /api/pix/transactions/history?ultimosDias=90
```

O período considera o dia atual.

### Período personalizado

Também é possível informar uma data inicial e uma data final.

Formato das datas:

```text
YYYY-MM-DD
```

Exemplo:

```http
GET /api/pix/transactions/history?dataInicio=2026-09-01&dataFim=2026-09-21
```

Parâmetros:

* `dataInicio`: data inicial do período.
* `dataFim`: data final do período.

## Funcionamento

Quando `ultimosDias` é informado, o backend calcula automaticamente a data inicial e a data final.

Exemplo para 7 dias:

```text
dataFim = data atual
dataInicio = data atual - 6 dias
```

Quando `ultimosDias` não é informado, o sistema utiliza `dataInicio` e `dataFim` recebidos na requisição.

O filtro utiliza a lógica já existente no serviço `PixTransactionService`, através do método:

```java
gerarExtrato(authenticatedUser, dataInicio, dataFim)
```

## Resposta

O endpoint retorna um objeto `PixExtractResponse` contendo o período consultado, os totais de entrada e saída e as transações encontradas.

Exemplo:

```json
{
  "periodoInicio": "2026-09-01T00:00:00",
  "periodoFim": "2026-09-21T23:59:59",
  "totalEntradas": 150.00,
  "totalSaidas": 75.50,
  "transacoes": [
    {
      "idTransacao": "uuid-da-transacao",
      "dataHora": "2026-09-15T14:30:00",
      "tipo": "SAIDA",
      "valor": 75.50,
      "descricao": "Pagamento",
      "contaContraparteId": "uuid-da-conta"
    }
  ]
}
```

Caso não existam transações no período informado, a lista de transações será retornada vazia.

## Arquivo alterado

```text
backend/src/main/java/com/gc/sistem_pix/pix/controller/PixTransactionController.java
```

## Validação

A implementação foi validada através da compilação do projeto com Maven:

```powershell
.\mvnw.cmd compile
```

Resultado esperado:

```text
BUILD SUCCESS
```

