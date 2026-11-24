-- Usuarios de teste recriados ao resetar o banco e reaplicar as migrations.
-- Todos os usuarios: senha Teste@123.
-- Todas as senhas sao armazenadas como hash BCrypt.

INSERT INTO usuario (id_usuario, nome, email, telefone, senha, role, ativo, criado_em)
VALUES
    (
        'a0000000-0000-0000-0000-000000000001',
        'Administrador Chefe (Owner)',
        'admin@gmail.com',
        '21972672346',
        '$2a$10$PnHc91an1Xo.0VvO/cKbhucDXCikr.BKgEpLRc5pdVlCe/o90D4/S',
        'OWNER',
        TRUE,
        CURRENT_TIMESTAMP
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        'Usuario Pessoa Fisica',
        'cpf@pix.test',
        '85990000002',
        '$2a$10$PnHc91an1Xo.0VvO/cKbhucDXCikr.BKgEpLRc5pdVlCe/o90D4/S',
        'USER',
        TRUE,
        CURRENT_TIMESTAMP
    ),
    (
        'a0000000-0000-0000-0000-000000000003',
        'Empresa de Teste LTDA',
        'cnpj@pix.test',
        '85990000003',
        '$2a$10$PnHc91an1Xo.0VvO/cKbhucDXCikr.BKgEpLRc5pdVlCe/o90D4/S',
        'USER',
        TRUE,
        CURRENT_TIMESTAMP
    ),
    (
        'a0000000-0000-0000-0000-000000000004',
        'Administrador do Sistema',
        'admin.sistema@pix.test',
        '85990000004',
        '$2a$10$PnHc91an1Xo.0VvO/cKbhucDXCikr.BKgEpLRc5pdVlCe/o90D4/S',
        'ADMIN',
        TRUE,
        CURRENT_TIMESTAMP
    );

INSERT INTO pessoa_fisica (id_pessoa_fisica, id_usuario, cpf, criado_em)
VALUES
    (
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        '00000000001',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000002',
        '12345678909',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000004',
        '52998224725',
        CURRENT_TIMESTAMP
    );

INSERT INTO pessoa_juridica (id_pessoa_juridica, id_usuario, cnpj, criado_em)
VALUES (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    '11222333000181',
    CURRENT_TIMESTAMP
);

INSERT INTO conta_bancaria (
    id_conta_bancaria, id_usuario, saldo, saldo_bloqueado, status, tipo,
    limite_transacoes, limite_pix, ativo, criado_em
)
VALUES
    (
        'c0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        10000.00,
        0.00,
        'DESBLOQUEADA',
        'PESSOA_FISICA',
        100,
        50000,
        TRUE,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000002',
        0.00,
        0.00,
        'DESBLOQUEADA',
        'PESSOA_FISICA',
        10,
        1000,
        TRUE,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000003',
        0.00,
        0.00,
        'DESBLOQUEADA',
        'PESSOA_JURIDICA',
        10,
        1000,
        TRUE,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000004',
        0.00,
        0.00,
        'DESBLOQUEADA',
        'PESSOA_FISICA',
        10,
        1000,
        TRUE,
        CURRENT_TIMESTAMP
    );
