-- ============================================================
-- MIGRATION: Finalização de Auditoria de Segurança
-- Restringe criação de audit_logs apenas para admins
-- ============================================================
-- NOTA: As demais políticas RLS já existem e foram revisadas
-- manualmente. Esta migration ajusta apenas a política de
-- audit_logs conforme recomendação da auditoria de segurança.
-- ============================================================

-- Remove política que permitia INSERT por qualquer usuário autenticado
DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON public.audit_logs;

-- Cria política restrita permitindo INSERT apenas por admins
CREATE POLICY "Admins can create audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));