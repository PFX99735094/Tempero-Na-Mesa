-- LIMPAR TODOS OS DADOS DO BANCO

-- Limpar itens de venda primeiro (por causa da chave estrangeira)
DELETE FROM itens_venda;

-- Limpar vendas
DELETE FROM vendas;

-- Limpar clientes
DELETE FROM clientes;

-- Limpar produtos
DELETE FROM produtos;

-- Verificar se foi limpo
SELECT * FROM produtos;
SELECT * FROM clientes;
SELECT * FROM vendas;
SELECT * FROM itens_venda;