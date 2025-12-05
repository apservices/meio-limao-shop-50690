import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, Users, LayoutGrid, Tag, FolderOpen, BarChart3, Eye, DollarSign, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";

interface RecentOrder {
  id: string;
  order_number: number;
  total_cents: number;
  status: string;
  payment_status: string;
  created_at: string;
  customer?: { name: string; email: string } | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    collections: 0,
    orders: 0,
    customers: 0,
    coupons: 0,
    revenue: 0,
    paidOrders: 0,
    pendingOrders: 0,
    avgTicket: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentOrders();
  }, []);

  const loadStats = async () => {
    const [productsRes, categoriesRes, collectionsRes, ordersRes, customersRes, couponsRes, paidOrdersRes, pendingOrdersRes] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("collections").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("coupons").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total_cents").eq("payment_status", "completed"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "pending"),
    ]);

    const paidOrders = paidOrdersRes.data || [];
    const revenue = paidOrders.reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100;
    const avgTicket = paidOrders.length > 0 ? revenue / paidOrders.length : 0;

    setStats({
      products: productsRes.count || 0,
      categories: categoriesRes.count || 0,
      collections: collectionsRes.count || 0,
      orders: ordersRes.count || 0,
      customers: customersRes.count || 0,
      coupons: couponsRes.count || 0,
      revenue,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrdersRes.count || 0,
      avgTicket,
    });
  };

  const loadRecentOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        total_cents,
        status,
        payment_status,
        created_at,
        customer:customers(name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentOrders(data || []);
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      completed: { label: "Pago", className: "bg-green-100 text-green-800" },
      pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
      failed: { label: "Falhou", className: "bg-red-100 text-red-800" },
      refunded: { label: "Reembolsado", className: "bg-purple-100 text-purple-800" },
    };
    const { label, className } = config[status] || { label: status, className: "bg-gray-100" };
    return <span className={`px-2 py-1 rounded text-xs ${className}`}>{label}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral da sua loja</p>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                R$ {stats.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Vendas aprovadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.avgTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Por pedido pago</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pagos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paidOrders}</div>
              <p className="text-xs text-muted-foreground">Vendas concluídas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coleções</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.collections}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cupons</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.coupons}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders + Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
              <button
                onClick={() => navigate("/admin/orders")}
                className="text-sm text-primary hover:underline"
              >
                Ver todos →
              </button>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum pedido ainda</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium">#{order.order_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customer?.name || order.customer?.email || "Cliente"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          R$ {(order.total_cents / 100).toFixed(2)}
                        </div>
                        {getPaymentStatusBadge(order.payment_status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="space-y-4">
            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/admin/reports")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Relatórios</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Análises detalhadas e métricas de vendas
                </p>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/admin/looks")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Looks</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gerenciar looks e combinações
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;