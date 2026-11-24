### Pix agendado

`POST /api/pix/scheduled-transactions` exige autenticação Bearer e recebe os mesmos campos do Pix imediato (`chavePix`, `tipoChave`, `contaDestinoId`, `valor`, `descricao`, `password`, `idempotencyKey`) e `scheduledAt` em ISO-8601 com offset, por exemplo `2030-01-01T10:00:00-03:00`. A senha é verificada na criação e não é persistida. A data deve ser futura. Não há reserva ou débito de saldo na criação.

Retorna `201`, `Location` e JSON com `id`, `contaOrigemId`, `contaDestinoId`, `chavePix`, `tipoChave`, `valor`, `descricao`, `scheduledAt` (UTC), `status`, `transactionId` e `failureReason`. `GET /api/pix/scheduled-transactions/{id}` permite ao titular acompanhar o resultado. Repetir a mesma `idempotencyKey` com os mesmos dados retorna o mesmo agendamento; dados diferentes retornam `409`. A precisão armazenada é de microssegundos.

O executor consulta pendências a cada 10 segundos (`app.pix.scheduled-poll-ms`), inclusive após reinicialização. Cada execução trava o agendamento e transfere numa única transação, usando as travas de chave e contas e validações do Pix imediato. Erros de negócio geram `FAILED` com motivo, sem nova tentativa; erros de infraestrutura são registrados no log e permanecem `PENDING` para nova tentativa. Sucesso gera `COMPLETED` e o identificador do comprovante. Os limites e saldo são avaliados no momento da execução; não há recorrência.

### Validação

Execute `cd backend && ./mvnw test`. O teste de contexto existente requer banco PostgreSQL e `DB_URL` configurados; os testes unitários específicos podem ser executados com `./mvnw -Dtest=ScheduledPixServiceTest,PixTransactionServiceTest test`.

Nesta execução, os testes unitários direcionados passaram. A suíte completa não terminou com sucesso porque `DB_URL` não estava configurado; a migração e a concorrência real em PostgreSQL não foram verificadas nesta execução.