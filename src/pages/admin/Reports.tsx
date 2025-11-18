import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, Users, TrendingUp, Package } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  totalProducts: number;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  created_at: string | null;
  source?: string | null;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string | null;
  source?: string | null;
}

const Reports = () => {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    totalProducts: 0,
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [exportingContacts, setExportingContacts] = useState(false);
  const [exportingNewsletter, setExportingNewsletter] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);

    const [
      ordersResult,
      customersResult,
      productsResult,
      contactResult,
      newsletterResult,
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("total_cents, created_at")
        .eq("payment_status", "paid"),
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase
        .from("contact_messages")
        .select("id, name, email, subject, created_at, source")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("newsletter_subscribers")
        .select("id, email, subscribed_at, source")
        .order("subscribed_at", { ascending: false })
        .limit(10),
    ]);

    if (ordersResult.error || customersResult.error || productsResult.error || contactResult.error || newsletterResult.error) {
      console.error("Erro ao carregar relatórios", {
        orders: ordersResult.error,
        customers: customersResult.error,
        products: productsResult.error,
        contacts: contactResult.error,
        newsletter: newsletterResult.error,
      });
      toast.error("Não foi possível carregar todos os dados. Tente novamente mais tarde.");
    }

    const orders = ordersResult.data || [];
    const customersCount = customersResult.count || 0;
    const productsCount = productsResult.count || 0;
    const contactData = contactResult.data || [];
    const newsletterData = newsletterResult.data || [];

    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_cents || 0), 0) || 0;
    const totalOrders = orders.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalRevenue: totalRevenue / 100,
      totalOrders,
      totalCustomers: customersCount || 0,
      averageOrderValue: averageOrderValue / 100,
      totalProducts: productsCount || 0,
    });

    // Generate sales data for last 7 days
    if (orders) {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });

      const salesByDay = last7Days.map((date) => {
        const dayOrders = orders.filter((order) =>
          order.created_at.startsWith(date)
        );
        const revenue = dayOrders.reduce((sum, order) => sum + order.total_cents, 0) / 100;
        return {
          date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          revenue,
          orders: dayOrders.length,
        };
      });

      setSalesData(salesByDay);
    }

    setContactMessages(contactData);
    setNewsletterSubscribers(newsletterData);

    setLoading(false);
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCsv = (rows: Record<string, string>[], filename: string) => {
    if (!rows.length) {
      toast.info("Nenhum registro disponível para exportação.");
      return;
    }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header] ?? "";
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportContactMessages = async () => {
    setExportingContacts(true);
    try {
      const { data } = await supabase
        .from("contact_messages")
        .select("name, email, phone, subject, message, source, created_at")
        .order("created_at", { ascending: false });

      const rows = (data || []).map((item) => ({
        Nome: item.name,
        Email: item.email,
        Telefone: item.phone || "-",
        Assunto: item.subject,
        Mensagem: item.message,
        Origem: item.source || "-",
        "Recebido em": formatDateTime(item.created_at),
      }));

      exportToCsv(rows, "contact-messages.csv");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível exportar as mensagens de contato.");
    } finally {
      setExportingContacts(false);
    }
  };

  const handleExportNewsletter = async () => {
    setExportingNewsletter(true);
    try {
      const { data } = await supabase
        .from("newsletter_subscribers")
        .select("email, name, source, subscribed_at")
        .order("subscribed_at", { ascending: false });

      const rows = (data || []).map((item) => ({
        Email: item.email,
        Nome: item.name || "-",
        Origem: item.source || "-",
        "Inscrito em": formatDateTime(item.subscribed_at),
      }));

      exportToCsv(rows, "newsletter-subscribers.csv");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível exportar os assinantes.");
    } finally {
      setExportingNewsletter(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Relatórios e Análises</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {stats.totalRevenue.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {stats.averageOrderValue.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vendas nos Últimos 7 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      name="Receita (R$)"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(var(--secondary))"
                      name="Pedidos"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pedidos por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" name="Pedidos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>Mensagens de Contato</CardTitle>
                    <p className="text-sm text-muted-foreground">Últimos envios recebidos no site</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportContactMessages}
                    disabled={exportingContacts}
                  >
                    {exportingContacts ? "Exportando..." : "Exportar CSV"}
                  </Button>
                </CardHeader>
                <CardContent>
                  {contactMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">
                      Nenhuma mensagem recebida ainda.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>E-mail</TableHead>
                          <TableHead>Assunto</TableHead>
                          <TableHead>Recebido</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactMessages.map((message) => (
                          <TableRow key={message.id}>
                            <TableCell>
                              <div className="font-medium">{message.name}</div>
                              <p className="text-xs text-muted-foreground">{message.source || "-"}</p>
                            </TableCell>
                            <TableCell>{message.email}</TableCell>
                            <TableCell className="max-w-[180px] truncate">{message.subject}</TableCell>
                            <TableCell>{formatDateTime(message.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>Assinantes da Newsletter</CardTitle>
                    <p className="text-sm text-muted-foreground">Leads captados em tempo real</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportNewsletter}
                    disabled={exportingNewsletter}
                  >
                    {exportingNewsletter ? "Exportando..." : "Exportar CSV"}
                  </Button>
                </CardHeader>
                <CardContent>
                  {newsletterSubscribers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">
                      Nenhuma inscrição registrada ainda.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>E-mail</TableHead>
                          <TableHead>Origem</TableHead>
                          <TableHead>Inscrito em</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newsletterSubscribers.map((subscriber) => (
                          <TableRow key={subscriber.id}>
                            <TableCell>{subscriber.email}</TableCell>
                            <TableCell>{subscriber.source || "-"}</TableCell>
                            <TableCell>{formatDateTime(subscriber.subscribed_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Reports;
