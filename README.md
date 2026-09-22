# Sistema Pix

## Sobre o Projeto

# Backend

## 💰 Contas Bancárias
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

# Frontend — Stack e Padrões do Projeto

## 1. Stack Principal

| Tecnologia | Definição |
|---|---|
| **Framework** | Next.js |
| **Biblioteca UI** | React |
| **Linguagem** | TypeScript |
| **Gerenciador de pacotes** | NPM |
| **Gerenciamento de versão do Node.js** | `.nvmrc` |
| **Arquitetura** | Feature-Based Architecture |
| **Tipo de aplicação** | SPA (Single Page Application) |
| **Roteamento** | React Router |

---

## 2. Arquitetura

O projeto seguirá o padrão **Feature-Based Architecture**, organizando o código por funcionalidades de negócio.

Cada feature deve concentrar seus próprios componentes, páginas, hooks, serviços, schemas e demais recursos relacionados à funcionalidade.

### Estrutura base

```text
src/
├── app/
│   ├── core/
│   ├── shared/
│   ├── features/
│   └── layout/
│
├── assets/
├── routes/
└── ...
```

### Princípios

- Organizar o código por **feature/funcionalidade**.
- Evitar agrupamento excessivo por tipo de arquivo.
- Manter baixo acoplamento entre features.
- Reutilizações globais devem ficar em `shared`.
- Recursos fundamentais da aplicação devem ficar em `core`.
- Layouts e estruturas visuais devem ficar em `layout`.

---

## 3. UI e Estilização

### UI Library

**shadcn/ui**

Utilizada como base para os componentes de interface da aplicação.

### CSS Framework

**Tailwind CSS**

Responsável pela estilização e composição visual dos componentes.

### Tema

- **Somente Dark Mode**
- Não haverá suporte a Light Mode.

---

## 4. Identidade Visual

### Cores

| Elemento | Hexadecimal |
|---|---|
| **Logo** | `#32BCA9` |
| **Elements** | `#33AA6E` |
| **Botões** | `#29925F` |
| **Background** | `#151B1F` |
| **Text** | `#E6E6E6` |
| **Text Secondary** | `#9EA2A6` |
| **Text Tertiary** | `#4CB277` |
| **Text Negative** | `#C86159` |
| **Input** | `#23272C` |

---

## 5. Tipografia

A aplicação utilizará os seguintes tamanhos de fonte:

| Uso | Tamanho |
|---|---:|
| Pequeno | `11px` |
| Normal | `13px` |
| Destaque | `15px` |
| Título | `25px` |

Os tamanhos devem ser utilizados de forma consistente para manter uma hierarquia visual clara.

---

## 6. Formulários e Validação

### React Hook Form

Responsável pelo gerenciamento dos formulários.

### Zod

Responsável pela definição dos schemas e validação dos dados.

### Padrão

```text
React Hook Form
       ↓
    Zod Schema
       ↓
Validação dos dados
```

A validação deve ser centralizada nos schemas sempre que possível, evitando regras duplicadas nos componentes.

---

## 7. Requisições HTTP

### Axios

O **Axios** será utilizado como cliente HTTP da aplicação.

Responsabilidades:

- Comunicação com a API;
- Configuração da URL base;
- Envio de headers;
- Inclusão do token JWT;
- Tratamento de respostas;
- Tratamento de erros HTTP;
- Interceptors quando necessário.

---

## 8. Autenticação

### JWT

A autenticação da aplicação utilizará **JSON Web Token (JWT)**.

Fluxo esperado:

```text
Login
  ↓
API
  ↓
JWT
  ↓
Frontend
  ↓
Requisições autenticadas
  ↓
API
```

O token deverá ser incluído nas requisições autenticadas através do Axios.

---

## 9. Tratamento de Erros HTTP

A aplicação deverá possuir tratamento padronizado para erros HTTP.

| Status | Tratamento |
|---|---|
| `400` | Dados inválidos / requisição incorreta |
| `401` | Não autenticado / token inválido |
| `403` | Sem permissão |
| `404` | Recurso não encontrado |
| `409` | Conflito |
| `422` | Erro de validação |
| `500` | Erro interno do servidor |

O tratamento deve evitar que cada componente implemente sua própria lógica de erro.

Preferencialmente, erros comuns devem ser tratados de forma centralizada através da camada HTTP/Axios.

---

## 10. Aliases de Importação

O projeto utilizará **um único alias** para importação de arquivos.

### Alias

```text
@
```
```tsx
import { Button } from '@/shared/components/Button';
```

### Regra

Utilizar o alias `@` como padrão para imports internos da aplicação.

---

# Resumo da Stack

```text
React
└── Next.js

Linguagem
└── TypeScript

Package Manager
└── NPM

Node Version
└── .nvmrc

Arquitetura
└── Feature-Based Architecture

Aplicação
└── SPA

Routing
└── React Router

UI
└── shadcn/ui

CSS
└── Tailwind CSS

Tema
└── Dark Mode Only

Formulários
├── React Hook Form
└── Zod

HTTP
└── Axios

Autenticação
└── JWT

Importações
└── Alias único: @

Tratamento
└── Erros HTTP centralizados
```

# Design System

```text
┌─────────────────────────────────────┐
│           DARK MODE ONLY             │
├─────────────────────────────────────┤
│ Logo             #32BCA9            │
│ Elements         #33AA6E            │
│ Buttons          #29925F            │
│ Background       #151B1F            │
│ Input            #23272C            │
│ Text             #E6E6E6            │
│ Text Secondary   #9EA2A6            │
│ Text Tertiary    #4CB277            │
│ Text Negative    #C86159            │
├─────────────────────────────────────┤
│ Typography                           │
│ 11px · 13px · 15px · 25px           │
└─────────────────────────────────────┘
```

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
