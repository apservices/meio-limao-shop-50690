-- Corrigir search_path da função para evitar vulnerabilidades de segurança
CREATE OR REPLACE FUNCTION cancel_expired_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_order RECORD;
  cancelled_count INTEGER := 0;
BEGIN
  -- Buscar pedidos pendentes há mais de 24 horas
  FOR expired_order IN
    SELECT id, order_number, customer_id, user_id
    FROM orders
    WHERE payment_status = 'pending'
      AND created_at < NOW() - INTERVAL '24 hours'
      AND status != 'cancelled'
  LOOP
    -- Atualizar status do pedido
    UPDATE orders
    SET 
      status = 'cancelled',
      payment_status = 'cancelled',
      notes = 'Pedido cancelado automaticamente - Pagamento não identificado após 24 horas',
      updated_at = NOW()
    WHERE id = expired_order.id;

    -- Registrar no log de auditoria
    INSERT INTO audit_logs (entity, entity_id, action, actor, diff)
    VALUES (
      'order',
      expired_order.id::text,
      'auto_cancel',
      'system',
      jsonb_build_object(
        'order_number', expired_order.order_number,
        'reason', 'Pagamento não identificado após 24 horas',
        'cancelled_at', NOW()
      )
    );

    cancelled_count := cancelled_count + 1;
  END LOOP;

  RAISE NOTICE 'Cancelados % pedidos expirados', cancelled_count;
END;
$$;

COMMENT ON FUNCTION cancel_expired_orders() IS 'Cancela automaticamente pedidos com pagamento pendente há mais de 24 horas. Executa a cada hora via pg_cron.';