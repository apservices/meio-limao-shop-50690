import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Mail, Phone, FileText, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { subDays } from "date-fns";

interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  document?: string;
  marketing_opt_in: boolean;
  created_at: string;
  total_spent?: number;
  orders_count?: number;
}

interface CustomerOrder {
  id: string;
  order_number: number;
  total_cents: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [marketingFilter, setMarketingFilter] = useState<string>("all");
  const [purchaseFilter, setPurchaseFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    // Load customers
    const { data: customersData, error: customersError } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (customersError) {
      toast({ title: "Erro ao carregar clientes", variant: "destructive" });
      return;
    }

    // Load orders with payment_status = completed to calculate totals
    const { data: ordersData } = await supabase
      .from("orders")
      .select("customer_id, total_cents, payment_status")
      .eq("payment_status", "completed");

    // Calculate totals per customer
    const customerStats = new Map<string, { total: number; count: number }>();
    ordersData?.forEach((order) => {
      if (order.customer_id) {
        const current = customerStats.get(order.customer_id) || { total: 0, count: 0 };
        customerStats.set(order.customer_id, {
          total: current.total + (order.total_cents || 0),
          count: current.count + 1,
        });
      }
    });

    // Merge data
    const enrichedCustomers = customersData?.map((c) => ({
      ...c,
      total_spent: (customerStats.get(c.id)?.total || 0) / 100,
      orders_count: customerStats.get(c.id)?.count || 0,
    })) || [];

    setCustomers(enrichedCustomers);
  };

  const loadCustomerOrders = async (customerId: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, total_cents, status, payment_status, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar pedidos", variant: "destructive" });
      return;
    }

    setCustomerOrders(data || []);
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    loadCustomerOrders(customer.id);
    setDetailsOpen(true);
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completed: { label: "Pago", variant: "default" },
      pending: { label: "Pendente", variant: "secondary" },
      failed: { label: "Falhou", variant: "destructive" },
      refunded: { label: "Reembolsado", variant: "outline" },
    };
    const { label, variant } = config[status] || { label: status, variant: "outline" };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const filteredCustomers = customers.filter((customer) => {
    // Search filter
    const matchesSearch =
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.document?.includes(searchQuery);

    // Marketing filter
    const matchesMarketing =
      marketingFilter === "all" ||
      (marketingFilter === "yes" && customer.marketing_opt_in) ||
      (marketingFilter === "no" && !customer.marketing_opt_in);

    // Purchase filter
    const matchesPurchase =
      purchaseFilter === "all" ||
      (purchaseFilter === "buyers" && (customer.orders_count || 0) > 0) ||
      (purchaseFilter === "never" && (customer.orders_count || 0) === 0);

    // Period filter
    let matchesPeriod = true;
    if (periodFilter !== "all") {
      const createdAt = new Date(customer.created_at);
      const now = new Date();
      const daysMap: Record<string, number> = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
      };
      const days = daysMap[periodFilter];
      if (days) {
        matchesPeriod = createdAt >= subDays(now, days);
      }
    }

    return matchesSearch && matchesMarketing && matchesPurchase && matchesPeriod;
  });

  const exportToCSV = () => {
    const headers = ["Email", "Nome", "Telefone", "Documento", "Marketing", "Total Gasto", "Pedidos", "Data de Cadastro"];
    const rows = filteredCustomers.map((c) => [
      c.email,
      c.name || "",
      c.phone || "",
      c.document || "",
      c.marketing_opt_in ? "Sim" : "Não",
      `R$ ${(c.total_spent || 0).toFixed(2)}`,
      c.orders_count || 0,
      new Date(c.created_at).toLocaleDateString("pt-BR"),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Clientes</h2>
          <Button onClick={exportToCSV} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email, nome ou documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="w-[150px]">
            <label className="text-sm font-medium mb-1 block">Marketing</label>
            <Select value={marketingFilter} onValueChange={setMarketingFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="yes">Aceita</SelectItem>
                <SelectItem value="no">Não aceita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[150px]">
            <label className="text-sm font-medium mb-1 block">Compras</label>
            <Select value={purchaseFilter} onValueChange={setPurchaseFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="buyers">Compradores</SelectItem>
                <SelectItem value="never">Nunca comprou</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[150px]">
            <label className="text-sm font-medium mb-1 block">Período</label>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredCustomers.length} cliente(s) encontrado(s)
        </div>

        <div className="bg-card rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Total Gasto</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Marketing</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name || "Sem nome"}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.phone ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      R$ {(customer.total_spent || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{customer.orders_count || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.marketing_opt_in ? "default" : "secondary"}>
                        {customer.marketing_opt_in ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(customer.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(customer)}
                      >
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Cliente</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Informações Pessoais</h3>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Nome</dt>
                        <dd className="font-medium">{selectedCustomer.name || "Não informado"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="font-medium">{selectedCustomer.email}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Telefone</dt>
                        <dd className="font-medium">{selectedCustomer.phone || "Não informado"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Documento</dt>
                        <dd className="font-medium font-mono">{selectedCustomer.document || "Não informado"}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Resumo</h3>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Total Gasto (aprovado)</dt>
                        <dd className="font-medium text-primary text-lg">
                          R$ {(selectedCustomer.total_spent || 0).toFixed(2)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Pedidos Pagos</dt>
                        <dd className="font-medium">{selectedCustomer.orders_count || 0}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Marketing</dt>
                        <dd>
                          {selectedCustomer.marketing_opt_in
                            ? "✓ Aceita receber comunicações"
                            : "✗ Não aceita receber comunicações"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Histórico de Pedidos</h3>
                  {customerOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum pedido realizado</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pedido</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Pagamento</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono">#{order.order_number}</TableCell>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell>R$ {(order.total_cents / 100).toFixed(2)}</TableCell>
                            <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{order.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Customers;