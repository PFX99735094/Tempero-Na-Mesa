-- =============================================
-- PERMISSÕES SUPABASE - Schema Public
-- Execute no SQL Editor do Supabase
-- =============================================

-- =============================================
-- PERMISSÕES PARA PRODUTOS
-- =============================================
GRANT SELECT ON public.produtos TO anon;
GRANT SELECT ON public.produtos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.produtos TO service_role;

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read produtos" ON public.produtos;
CREATE POLICY "Anyone can read produtos" ON public.produtos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service can manage produtos" ON public.produtos;
CREATE POLICY "Service can manage produtos" ON public.produtos FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- PERMISSÕES PARA CLIENTES
-- =============================================
GRANT SELECT ON public.clientes TO anon;
GRANT SELECT ON public.clientes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO service_role;

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read clientes" ON public.clientes;
CREATE POLICY "Anyone can read clientes" ON public.clientes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service can manage clientes" ON public.clientes;
CREATE POLICY "Service can manage clientes" ON public.clientes FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- PERMISSÕES PARA VENDAS
-- =============================================
GRANT SELECT ON public.vendas TO anon;
GRANT SELECT ON public.vendas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendas TO service_role;

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read vendas" ON public.vendas;
CREATE POLICY "Anyone can read vendas" ON public.vendas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service can manage vendas" ON public.vendas;
CREATE POLICY "Service can manage vendas" ON public.vendas FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- PERMISSÕES PARA ITENS_VENDA
-- =============================================
GRANT SELECT ON public.itens_venda TO anon;
GRANT SELECT ON public.itens_venda TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.itens_venda TO service_role;

ALTER TABLE public.itens_venda ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read itens_venda" ON public.itens_venda;
CREATE POLICY "Anyone can read itens_venda" ON public.itens_venda FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service can manage itens_venda" ON public.itens_venda;
CREATE POLICY "Service can manage itens_venda" ON public.itens_venda FOR ALL USING (auth.role() = 'service_role');