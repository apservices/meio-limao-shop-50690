import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Hourglass, Loader2, XCircle } from "lucide-react";
import { ConvertGuestModal } from "@/components/ConvertGuestModal";

const formatCurrencyFromCents = (value?: number | null) => {
  if (value == null) return "--";
  return (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const statusCopy = {
  success: {
    title: "Pagamento confirmado",
    description: "Seu pedido já está sendo preparado com carinho.",
    icon: <CheckCircle2 className="h-16 w-16 text-green-600" />,
  },
  pending: {
    title: "Pagamento em análise",
    description: "Estamos aguardando a confirmação do pagamento. Isso pode levar alguns minutos.",
    icon: <Hourglass className="h-16 w-16 text-amber-500" />,
  },
  failure: {
    title: "Não conseguimos aprovar o pagamento",
    description: "Confira os dados do seu pagamento ou tente novamente com outra forma.",
    icon: <XCircle className="h-16 w-16 text-destructive" />,
  },
};

type StatusVariant = keyof typeof statusCopy;

type OrderStatus = {
  id: string;
  status: string;
  payment_status: string | null;
  total_cents: number | null;
  subtotal_cents: number | null;
  shipping_cents: number | null;
  order_number: number | null;
  email: string | null;
};

const translateStatus = (status?: string | null) => {
  if (!status) return "Indefinido";
  const dictionary: Record<string, string> = {
    pending: "Pendente",
    processing: "Processando",
    completed: "Concluído",
    cancelled: "Cancelado",
    failed: "Falhou",
    refunded: "Reembolsado",
  };
  return dictionary[status] || status;
};

const CheckoutStatusPage = ({ variant }: { variant: StatusVariant }) => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setErrorMessage("Pedido não informado. Verifique o link recebido no e-mail.");
      setOrder(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from('orders')
      .select('id, status, payment_status, total_cents, subtotal_cents, shipping_cents, order_number, email')
      .eq('id', orderId)
      .single();

    if (error || !data) {
      console.error('Erro ao carregar pedido:', error);
      setErrorMessage("Não conseguimos localizar o pedido informado.");
      setOrder(null);
    } else {
      setOrder(data);
    }

    setIsLoading(false);
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
    
    // Verificar se é usuário anônimo
    const checkAnonymous = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.is_anonymous && variant === 'success') {
        setIsAnonymous(true);
      }
    };
    
    void checkAnonymous();
  }, [loadOrder, variant]);

  const copy = statusCopy[variant];

  return (
    <div className="min-h-screen bg-accent/5">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-card rounded-2xl border shadow-sm p-8 text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            {copy.icon}
            <div>
              <h1 className="text-3xl font-serif font-semibold">{copy.title}</h1>
              <p className="text-muted-foreground mt-2">{copy.description}</p>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Consultando status em tempo real...
            </div>
          )}

          {errorMessage && (
            <div className="text-destructive text-sm">
              {errorMessage}
            </div>
          )}

          {order && !isLoading && (
            <div className="text-left space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pedido</span>
                  <span className="font-medium">#{order.order_number ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status do pedido</span>
                  <Badge variant="outline">{translateStatus(order.status)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status do pagamento</span>
                  <Badge variant={order.payment_status === 'completed' ? 'default' : 'secondary'}>
                    {translateStatus(order.payment_status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{formatCurrencyFromCents(order.total_cents)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Produtos</span>
                  <span>{formatCurrencyFromCents(order.subtotal_cents)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span>{formatCurrencyFromCents(order.shipping_cents)}</span>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Dica:</p>
                <p>
                  Você sempre pode voltar a esta página pelo link enviado no e-mail {order.email ?? ''}.<br />
                  Se o pagamento ainda estiver pendente, tente atualizar o status abaixo.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => loadOrder()}
                >
                  Atualizar status
                </Button>
              </div>
            </div>
          )}

          {isAnonymous && (
            <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
              <h3 className="font-semibold text-lg mb-2">Salve seus dados!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie uma conta para acompanhar seu pedido e facilitar suas próximas compras.
              </p>
              <Button onClick={() => setShowConvertModal(true)} size="lg">
                Criar Conta Agora
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/shop">Voltar para a loja</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/account">Acompanhar pedido</Link>
            </Button>
          </div>
        </div>
      </main>

      <ConvertGuestModal open={showConvertModal} onOpenChange={setShowConvertModal} />
    </div>
  );
};

export const CheckoutSuccessPage = () => <CheckoutStatusPage variant="success" />;
export const CheckoutPendingPage = () => <CheckoutStatusPage variant="pending" />;
export const CheckoutFailurePage = () => <CheckoutStatusPage variant="failure" />;

export default CheckoutStatusPage;
