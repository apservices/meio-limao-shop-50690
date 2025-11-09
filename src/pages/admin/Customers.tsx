import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Mail, Phone, FileText } from "lucide-react";
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
import AdminLayout from "@/components/AdminLayout";

interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  document?: string;
  marketing_opt_in: boolean;
  created_at: string;
}

interface CustomerOrder {
  id: string;
  order_number: number;
  total_cents: number;
  status: string;
  created_at: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar clientes", variant: "destructive" });
      return;
    }

    setCustomers(data || []);
  };

  const loadCustomerOrders = async (customerId: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, total_cents, status, created_at")
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

  const filteredCustomers = customers.filter((customer) =>
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.document?.includes(searchQuery)
  );

  const exportToCSV = () => {
    const headers = ["Email", "Nome", "Telefone", "Documento", "Marketing", "Data de Cadastro"];
    const rows = customers.map((c) => [
      c.email,
      c.name || "",
      c.phone || "",
      c.document || "",
      c.marketing_opt_in ? "Sim" : "Não",
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

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email, nome ou documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="bg-card rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Marketing</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                    <TableCell className="font-mono text-sm">
                      {customer.document || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          customer.marketing_opt_in
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {customer.marketing_opt_in ? "Sim" : "Não"}
                      </span>
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
                    <h3 className="font-semibold mb-2">Marketing</h3>
                    <p className="text-sm">
                      {selectedCustomer.marketing_opt_in
                        ? "✓ Aceita receber comunicações"
                        : "✗ Não aceita receber comunicações"}
                    </p>
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
                            <TableCell>
                              <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                {order.status}
                              </span>
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
