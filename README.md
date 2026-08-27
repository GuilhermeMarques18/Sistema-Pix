## Rotas da API

As rotas abaixo usam a aplicação local como base, por exemplo: `http://localhost:8080`.

As rotas protegidas exigem o header `Authorization: Bearer <token>`, obtido pela rota de login.

### Autenticação

#### Login

**POST** `/api/auth/login`

Body:

```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

Resposta:

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer"
}
```

### Usuários

#### Cadastrar pessoa física

**POST** `/api/users/pessoa-fisica`

Body:

```json
{
  "name": "João da Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "telefone": "+5511999999999",
  "cpf": "123.456.789-00"
}
```

#### Cadastrar pessoa jurídica

**POST** `/api/users/pessoa-juridica`

Body:

```json
{
  "name": "Avante Tech Junior",
  "email": "contato@avantetech.com",
  "password": "senha123",
  "telefone": "+5588988887777",
  "cnpj": "11.222.333/0001-81"
}
```

#### Listar todos os usuários

**GET** `/api/users`

Rota protegida por autenticação.

#### Buscar usuário por ID

**GET** `/api/users/{id}`

Substitua `{id}` pelo UUID do usuário. Rota protegida por autenticação.

#### Remover usuário

**DELETE** `/api/users/{id}`

Substitua `{id}` pelo UUID do usuário. Rota protegida por autenticação.
