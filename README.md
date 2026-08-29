# Sistema Pix

## Sobre o Projeto

Este projeto é desenvolvido como parte da disciplina de **Gerência de Configuração**, na Universidade Federal do Ceará (UFC) - Campus Quixadá.
z
O objetivo é simular, na prática, um projeto real de desenvolvimento de software: uso de controle de versão em equipe, revisão de código via Pull Requests, boas práticas de POO e a construção de um sistema funcional que reproduz parte das funcionalidades do Pix.

## Diagrama do Banco de Dados

O modelo relacional cobre usuários (pessoa física/jurídica), contas bancárias, chaves Pix, contatos, transações, agendamentos, notificações e histórico de atividades.

![Modelo Relacional](https://claude.ai/chat/docs/modelo-relacional-pix.png)


## Protótipo (Telas)

Protótipo completo no Figma: https://www.figma.com/design/JS6mK1ufiTLm2fgmaVDWsj/Prot%C3%B3tipo---PIX?node-id=0-1&p=f&t=UPhI2I4n5j4rvHjS-0

O protótipo de interface cobre o fluxo completo do app: onboarding, login/cadastro, dashboard, perfil, extrato e gerenciamento de chaves Pix.


## Tecnologias Utilizadas

-   **Java 21** (JDK)
-   **Spring Boot** (Web MVC, Data JPA, Security, Validation)
-   **PostgreSQL** (Banco de dados relacional)
-   **Maven** (Gerenciador de dependências e build)
-   **Lombok** (Redução de código boilerplate)

## Fluxo de Trabalho (Git)

Seguindo o modelo pedido pela disciplina:

-   **`main`**: única branch de referência do projeto — deve estar sempre estável/funcional.
-   **Feature branches**: cada funcionalidade (ou conjunto de funcionalidades) é desenvolvida em uma branch própria a partir da `main` (ex: `feature/cadastro-usuario`, `feature/chave-pix`).
-   **Pull Requests**: ao concluir, abre-se um PR da feature branch para a `main`. O PR é revisado pelo coordenador do time antes do merge.
-   Commits devem ser regulares e a participação de cada integrante é avaliada pelo histórico de commits no PR.

## Entregas do Projeto

O desenvolvimento está dividido em três entregas principais:

**Pix 1**

-   Cadastrar, atualizar e remover Usuário
-   Criar, atualizar e remover Conta Bancária
-   Receber e Transferir valores via Pix
-   Gerar Chave Pix Aleatória
-   Validar e Associar Chave Pix (CPF, CNPJ, Email ou Telefone) a uma conta

**Pix 2**

-   Executar e Cancelar Transação Pix
-   Adicionar Transação ao Histórico / Listar Todas as Transações
-   Filtrar Transações por Data
-   Notificar Usuário sobre Transações
-   Gerar Relatório de Transações (por usuário e por período)
-   Consultar Saldo da Conta
-   Bloquear Conta por Suspeita de Fraude

**Pix 3**

-   Definir Limite de Transações Diárias
-   Desbloquear Chave Pix Suspensa / Alterar Chave Pix Associada
-   Habilitar Notificação por SMS ou Email
-   Integrar Chaves Pix com Contatos do Usuário
-   Estorno de Valores de Transações Indevidas
-   Consulta de Histórico de Logins e Atividades
-   Registrar Localização de Transações Pix
-   Realizar Pix Agendado

## Módulo de Conta Bancária (API - Endpoints)

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


## Como Executar o Projeto 

Pré-requisitos: Java 21 (JDK) e um PostgreSQL disponível (local ou via Docker).

1.  **Clone o repositório**
    
    ```bash
    git clone https://github.com/GuilhermeMarques18/Sistema-Pix.git
    
    
    ```
    
2.  **Acesse a pasta do projeto**
    
    ```bash
    cd Sistema-Pix
    
    
    ```
    
3.  **Compile e baixe as dependências**
    
    ```bash
    ./mvnw clean install       # Linux/Mac
    .\mvnw.cmd clean install   # Windows
    
    
    ```
    
4.  **Configure o Banco de Dados** Atualize as credenciais em `src/main/resources/application.properties` (URL, usuário e senha do PostgreSQL).
    
5.  **Execute a aplicação**
    
    ```bash
    ./mvnw spring-boot:run       # Linux/Mac
    .\mvnw.cmd spring-boot:run   # Windows
    
    
    ```
    

## Equipe

-   [Guilherme Marques](https://github.com/GuilhermeMarques18)
-   [Ryan](https://github.com/ryanlbpimentel)
-   [Davy](https://github.com/dnastins)
-   [Geovana](https://github.com/Dev-Nana)
-   [Ana Luiza](https://github.com/Nalu2)