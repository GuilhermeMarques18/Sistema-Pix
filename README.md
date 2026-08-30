# Sistema-Pix / Branch de Conta Bancária

Sistema em Java simulando funcionalidades do PIX, desenvolvido para a disciplina de Gerência de Configuração (UFC Quixadá).

# Backend

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
