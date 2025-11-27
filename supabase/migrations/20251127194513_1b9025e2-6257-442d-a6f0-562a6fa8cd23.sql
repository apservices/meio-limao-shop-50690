-- Drop políticas antigas da tabela orders
drop policy if exists "Users can insert own orders" on orders;
drop policy if exists "Users view own orders via customer" on orders;
drop policy if exists "Users create own orders" on orders;
drop policy if exists "Block anonymous from orders" on orders;
drop policy if exists "Admins can view all orders" on orders;
drop policy if exists "Admins can update all orders" on orders;

-- Habilitar RLS com force
alter table orders enable row level security;
alter table orders force row level security;

-- INSERT: só permite se user_id = auth.uid() (funciona para autenticados e anônimos)
create policy "Users can insert own orders"
  on orders for insert
  to authenticated
  with check (auth.uid() = user_id);

-- SELECT: usuários veem suas próprias orders ou admins veem todas
create policy "Users can view own orders"
  on orders for select
  to authenticated
  using (
    auth.uid() = user_id 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- UPDATE: apenas admins podem atualizar
create policy "Admins can update orders"
  on orders for update
  to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));

-- DELETE: apenas admins podem deletar
create policy "Admins can delete orders"
  on orders for delete
  to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));