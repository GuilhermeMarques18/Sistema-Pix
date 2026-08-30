# Padrões e Contexto da Aplicação — Sistema Pix

## 1. Contexto do Produto

**Sistema Pix** é uma aplicação web de transações financeiras via Pix.

O produto permite ao usuário:

- Visualizar saldo atual e limite utilizado
- Realizar transferências (Enviar / Receber)
- Agendar pagamentos
- Consultar extrato de transações
- Gerenciar chaves Pix
- Configurar ajustes da conta

A interface segue o padrão de aplicativos financeiros móveis (ex: Nubank, Inter), com foco em clareza, segurança visual e velocidade de acesso às ações mais usadas.

---

## 2. Metodologia: Mobile First

Todo o desenvolvimento deve partir da experiência mobile e evoluir para telas maiores.

### Breakpoints utilizados (Tailwind padrão)

| Breakpoint | Tamanho |
|---|---|
| base (mobile) | `< 640px` |
| `sm` | `≥ 640px` |
| `md` | `≥ 768px` |
| `lg` | `≥ 1024px` |

### Regras

- Escrever os estilos base para mobile primeiro.
- Adicionar variações para telas maiores com prefixos (`sm:`, `md:`, `lg:`).
- Nunca assumir que o usuário está em desktop.
- Componentes devem ser testados visualmente em largura de 375px.

### Máxima largura do conteúdo

O conteúdo principal é centralizado e limitado a `max-w-md` (448px) para preservar a experiência mobile em telas maiores.

---

## 3. Estrutura de Features

Cada feature segue a mesma estrutura interna:

```text
features/
└── [nome-da-feature]/
    ├── components/      ← Componentes exclusivos da feature
    │   └── index.ts     ← Barrel export dos componentes
    ├── hooks/           ← Hooks customizados da feature
    ├── pages/           ← Página(s) da feature
    ├── schemas/         ← Schemas Zod de validação
    ├── services/        ← Chamadas à API
    └── index.ts         ← Barrel export da feature
```

Importar sempre pelo barrel da feature:

```tsx
import { DashboardPage } from '@/app/features/dashboard';
```

---

## 4. Nomenclatura

### Arquivos

| Tipo | Padrão | Exemplo |
|---|---|---|
| Componente | PascalCase | `BalanceCard.tsx` |
| Hook | camelCase com `use` | `useLogin.ts` |
| Service | camelCase com `.service` | `auth.service.ts` |
| Schema | camelCase com `.schema` | `login.schema.ts` |
| Barrel | sempre `index.ts` | `index.ts` |
| Página | PascalCase com `Page` | `DashboardPage.tsx` |

### Componentes

- Props interface nomeada como `[ComponentName]Props`
- Funções de componente com `export function` (sem default export em componentes)
- Default export apenas em páginas Next.js (`pages/`)

### Variáveis e funções

- `camelCase` para variáveis, funções e hooks
- `UPPER_SNAKE_CASE` para constantes mock e configurações fixas

---

## 5. Componentes

### Hierarquia

```text
shared/components/ui/   ← Primitivos (Button, Input, Label)
features/*/components/  ← Composições específicas da feature
app/layout/             ← Estrutura visual global
```

### Regras

- Componentes `shared` devem ser genéricos e reutilizáveis.
- Componentes de feature não devem ser importados por outras features.
- Se um componente de feature precisar ser compartilhado, mover para `shared`.

### Acessibilidade

- Todo botão sem texto visível deve ter `aria-label`.
- Elementos de navegação devem ter `aria-label` e `aria-current`.
- Campos de formulário devem ter `id` e `Label` associado.
- Alternar visibilidade (ex: saldo) deve atualizar o `aria-label` do botão.

---

## 6. Telas da Aplicação

### Telas previstas

| Rota | Descrição |
|---|---|
| `/login` | Autenticação do usuário |
| `/dashboard` | Tela inicial — saldo, ações rápidas, transações |
| `/extrato` | Histórico completo de transações |
| `/chaves` | Gerenciamento de chaves Pix |
| `/ajustes` | Configurações da conta |

### Navegação

A navegação principal é feita pela **BottomNav** (barra inferior), presente em todas as telas autenticadas. A rota ativa é indicada com ícone `fill` e cor `brand-element`.

---

## 7. Transações

### Tipos

| Tipo | Cor | Ícone |
|---|---|---|
| `credit` (entrada) | `text-brand-element` (`#33AA6E`) | `ArrowLineDown` (fill, bold) |
| `debit` (saída) | `text-text-negative` (`#C86159`) | `ArrowLineUp` (fill, bold) |

### Formato de valor

Sempre usar `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`.

Prefixo:
- Entrada: `+ R$ 700,00`
- Saída: `- R$ 200,00`

---

## 8. Estados da Interface

### Loading

- Botões em loading devem exibir texto descritivo (ex: `Entrando...`) e estar `disabled`.
- Listas em loading devem usar skeleton ou indicador visual — não deixar a tela em branco.

### Vazio

- Listas sem dados devem exibir mensagem amigável, nunca componente vazio.

### Erro

- Erros de formulário aparecem abaixo do campo com `text-text-negative`.
- Erros HTTP são tratados centralmente pelo interceptor Axios.

---

## 9. Dados Mock

Enquanto o backend está em desenvolvimento, os dados são declarados como constantes no topo da página com prefixo `MOCK_`:

```ts
const MOCK_USER = 'Geovana Veras';
const MOCK_BALANCE = { balance: 400, used: 4600, limit: 5000 };
const MOCK_TRANSACTIONS: Transaction[] = [ ... ];
```

Ao integrar com a API, substituir os mocks por chamadas nos `services/` da feature e consumir via hooks.

---

## 10. Padrão de Estilo (Tailwind)

### Classes utilitárias prioritárias

- Cores sempre via tokens do design system (`text-text`, `bg-bg-input`, `text-brand-element`).
- Nunca usar cores hardcoded como `text-green-500` ou `bg-gray-900`.
- Bordas arredondadas padrão: `rounded-xl` para cards e botões de ação.

### Interatividade

- Hover: `hover:bg-[#2a3035]` ou variação sutil da cor base.
- Active/press: `active:scale-95` para feedback tátil.
- Transições: `transition-colors` e `transition-all duration-150`.
- Focus visible: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo`.

### Espaçamento

- Padding horizontal padrão das seções: `px-4`
- Padding vertical entre seções: `pt-4` / `pt-5`
- Gap entre itens de lista: `gap-2`

---

## 11. Integração com Backend (Java / Spring Boot)

O backend é desenvolvido em Java com Spring Boot e expõe uma API REST.

A comunicação é feita via Axios, configurado em `core/http/api.ts`.

Fluxo esperado:

```text
Componente / Hook
      ↓
  Service (feature/services)
      ↓
  Axios (core/http/api.ts)
      ↓
  Spring Boot API
```

A URL base da API é configurada em `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```
