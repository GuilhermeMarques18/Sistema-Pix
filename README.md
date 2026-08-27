## 📍 Endpoints da API

A URL base para todos os endpoints de usuário é: `/api/users`

### 1. Cadastrar Pessoa Física
Cria um novo usuário do tipo Pessoa Física. O sistema valida se o e-mail, telefone ou CPF já estão em uso.

* **Método:** `POST`
* **Rota:** `/pessoa-fisica`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "name": "João da Silva",
    "email": "joao@email.com",
    "telefone": "+5511999999999",
    "cpf": "123.456.789-00"
  }

### 2. Cadastrar Pessoa Jurídica
Cria um novo usuário do tipo Pessoa Jurídica com validação específica de CNPJ.
* **Método:** `POST`
* **Rota:** `/pessoa-juridica`
* **Corpo da Requisição (JSON):**
  ```json
    {
    "name": "Avante Tech Junior",
    "email": "contato@avantetech.com",
    "telefone": "+5588988887777",
    "cnpj": "11.222.333/0001-81"
    }
