import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, Eye, MousePointerClick, Target } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  totalProducts: number;
  conversionRate: number;
  totalPageViews: number;
  totalProductViews: number;
  totalAddToCarts: number;
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

interface TopProduct {
  product_id: string;
  product_name: string;
  view_count: number;
}

interface CustomerJourneyEvent {
  event_type: string;
  event_data: any;
  created_at: string;
  customer_email?: string;
}

const Reports = () => {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    totalProducts: 0,
    conversionRate: 0,
    totalPageViews: 0,
    totalProductViews: 0,
    totalAddToCarts: 0,
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [exportingContacts, setExportingContacts] = useState(false);
  const [exportingNewsletter, setExportingNewsletter] = useState(false);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentJourney, setRecentJourney] = useState<CustomerJourneyEvent[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);

    const [
      ordersResult,
      customersResult,
      productsResult,
      eventsResult,
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("total_cents, created_at")
        .eq("payment_status", "paid"),
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase
        .from("customer_events")
        .select("event_type, event_data, created_at, customer_id")
        .order("created_at", { ascending: false }),
    ]);

    if (ordersResult.error || customersResult.error || productsResult.error || eventsResult.error) {
      console.error("Erro ao carregar relatórios", {
        orders: ordersResult.error,
        customers: customersResult.error,
        products: productsResult.error,
        events: eventsResult.error,
      });
      toast.error("Não foi possível carregar todos os dados. Tente novamente mais tarde.");
    }

    const orders = ordersResult.data || [];
    const customersCount = customersResult.count || 0;
    const productsCount = productsResult.count || 0;
    const events = eventsResult.data || [];

    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_cents || 0), 0) || 0;
    const totalOrders = orders.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate analytics from events
    const pageViews = events.filter(e => e.event_type === 'page_view').length;
    const productViews = events.filter(e => e.event_type === 'product_view').length;
    const addToCarts = events.filter(e => e.event_type === 'add_to_cart').length;
    const purchases = events.filter(e => e.event_type === 'purchase').length;
    
    // Conversion rate = (purchases / page views) * 100
    const conversionRate = pageViews > 0 ? (purchases / pageViews) * 100 : 0;

    setStats({
      totalRevenue: totalRevenue / 100,
      totalOrders,
      totalCustomers: customersCount || 0,
      averageOrderValue: averageOrderValue / 100,
      totalProducts: productsCount || 0,
      conversionRate,
      totalPageViews: pageViews,
      totalProductViews: productViews,
      totalAddToCarts: addToCarts,
    });

    // Top viewed products
    const productViewsMap = new Map<string, { count: number; name: string }>();
    events
      .filter(e => e.event_type === 'product_view' && e.event_data)
      .forEach(e => {
        const data = e.event_data as any;
        if (data?.product_id) {
          const productId = data.product_id;
          const productName = data.product_name || 'Produto Desconhecido';
          const current = productViewsMap.get(productId) || { count: 0, name: productName };
          productViewsMap.set(productId, { count: current.count + 1, name: productName });
        }
      });

    const topProductsList = Array.from(productViewsMap.entries())
      .map(([product_id, data]) => ({
        product_id,
        product_name: data.name,
        view_count: data.count,
      }))
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 10);

    setTopProducts(topProductsList);

    // Customer journey (últimos 20 eventos)
    const journeyEvents = events.slice(0, 20).map(e => ({
      event_type: e.event_type,
      event_data: e.event_data,
      created_at: e.created_at,
      customer_email: e.customer_id || 'Visitante',
    }));
    setRecentJourney(journeyEvents);

    // Funnel data
    const funnelSteps = [
      { name: 'Visualizações', value: pageViews, fill: 'hsl(var(--primary))' },
      { name: 'Produtos Vistos', value: productViews, fill: 'hsl(var(--secondary))' },
      { name: 'Adicionou ao Carrinho', value: addToCarts, fill: 'hsl(var(--accent))' },
      { name: 'Compras', value: purchases, fill: 'hsl(var(--success))' },
    ];
    setFunnelData(funnelSteps);

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
    toast.error("Funcionalidade temporariamente indisponível.");
    setExportingContacts(false);
  };

  const handleExportNewsletter = async () => {
    setExportingNewsletter(true);
    toast.error("Funcionalidade temporariamente indisponível.");
    setExportingNewsletter(false);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.conversionRate.toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalPageViews} visitas → {stats.totalOrders} compras
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProductViews}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    produtos vistos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Adicionados</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAddToCarts}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    itens ao carrinho
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {stats.totalRevenue.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalOrders} pedidos
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funil de Conversão</CardTitle>
                  <p className="text-sm text-muted-foreground">Jornada completa do visitante até a compra</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={funnelData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Produtos Mais Vistos</CardTitle>
                  <p className="text-sm text-muted-foreground">Produtos com maior interesse</p>
                </CardHeader>
                <CardContent>
                  {topProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum dado de visualização ainda.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {topProducts.map((product, index) => (
                        <div
                          key={product.product_id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">{product.product_name}</p>
                              <p className="text-xs text-muted-foreground">
                                ID: {product.product_id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="font-bold">{product.view_count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                <CardTitle>Jornada do Cliente em Tempo Real</CardTitle>
                <p className="text-sm text-muted-foreground">Últimos 20 eventos registrados no site</p>
              </CardHeader>
              <CardContent>
                {recentJourney.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum evento registrado ainda.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {recentJourney.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {event.event_type === 'page_view' && <Eye className="h-4 w-4 text-blue-500" />}
                          {event.event_type === 'product_view' && <Package className="h-4 w-4 text-purple-500" />}
                          {event.event_type === 'add_to_cart' && <ShoppingCart className="h-4 w-4 text-orange-500" />}
                          {event.event_type === 'purchase' && <DollarSign className="h-4 w-4 text-green-500" />}
                          {event.event_type === 'checkout_start' && <MousePointerClick className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {event.event_type.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.created_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          {event.event_data && (
                            <p className="text-sm mt-1 text-muted-foreground truncate">
                              {event.event_data.product_name && `Produto: ${event.event_data.product_name}`}
                              {event.event_data.path && `Página: ${event.event_data.path}`}
                              {event.event_data.cart_value && `Valor: R$ ${(event.event_data.cart_value / 100).toFixed(2)}`}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {typeof event.customer_email === 'string' && event.customer_email.includes('@')
                            ? event.customer_email.split('@')[0]
                            : 'Anônimo'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
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
