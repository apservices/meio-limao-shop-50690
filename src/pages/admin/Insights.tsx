import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Eye, 
  TrendingUp, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  Filter
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";

interface CustomerInsight {
  id: string;
  customer_id: string;
  insight_type: string;
  insight_data: any;
  priority: string;
  status: string;
  created_at: string;
  customer?: {
    name: string;
    email: string;
  };
}

const Insights = () => {
  const [insights, setInsights] = useState<CustomerInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customer_insights")
        .select(`
          *,
          customer:customers(name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInsights(data || []);
    } catch (error) {
      console.error("Erro ao carregar insights:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os insights.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeCustomer = async (customerId: string) => {
    setAnalyzing(customerId);
    try {
      const { error } = await supabase.functions.invoke("analyze-customer-behavior", {
        body: { customer_id: customerId },
      });

      if (error) throw error;

      toast({
        title: "Análise Concluída",
        description: "Os insights do cliente foram atualizados.",
      });
      
      loadInsights();
    } catch (error) {
      console.error("Erro ao analisar cliente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível analisar o comportamento do cliente.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const updateInsightStatus = async (insightId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("customer_insights")
        .update({ status: newStatus })
        .eq("id", insightId);

      if (error) throw error;

      toast({
        title: "Status Atualizado",
        description: "O status do insight foi atualizado com sucesso.",
      });
      
      loadInsights();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "abandoned_cart":
        return ShoppingCart;
      case "browse_no_purchase":
        return Eye;
      case "ai_behavior_analysis":
        return Sparkles;
      default:
        return TrendingUp;
    }
  };

  const getInsightLabel = (type: string) => {
    const labels: Record<string, string> = {
      abandoned_cart: "Carrinho Abandonado",
      browse_no_purchase: "Navegou Sem Comprar",
      ai_behavior_analysis: "Análise de Comportamento AI",
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      urgent: "Urgente",
      high: "Alta",
      medium: "Média",
      low: "Baixa",
    };
    return labels[priority] || priority;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "converted": return "default";
      case "contacted": return "secondary";
      case "ignored": return "outline";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: "Novo",
      contacted: "Contatado",
      converted: "Convertido",
      ignored: "Ignorado",
    };
    return labels[status] || status;
  };

  // Filter insights
  const filteredInsights = insights.filter((insight) => {
    const matchesType = typeFilter === "all" || insight.insight_type === typeFilter;
    const matchesPriority = priorityFilter === "all" || insight.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || insight.status === statusFilter;
    return matchesType && matchesPriority && matchesStatus;
  });

  // Calculate stats from filtered insights
  const abandonedCarts = insights.filter(i => i.insight_type === "abandoned_cart" && i.status === "new").length;
  const browseNoPurchase = insights.filter(i => i.insight_type === "browse_no_purchase" && i.status === "new").length;
  const highPriority = insights.filter(i => i.priority === "high" || i.priority === "urgent").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Insights de Clientes</h1>
            <p className="text-muted-foreground">
              Análise de comportamento e oportunidades de conversão
            </p>
          </div>
          <Button onClick={loadInsights} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Carrinhos Abandonados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{abandonedCarts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Navegaram Sem Comprar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{browseNoPurchase}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{highPriority}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="w-[180px]">
                <label className="text-sm font-medium mb-1 block">Tipo de Insight</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="abandoned_cart">Carrinho Abandonado</SelectItem>
                    <SelectItem value="browse_no_purchase">Navegou Sem Comprar</SelectItem>
                    <SelectItem value="ai_behavior_analysis">Análise AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[150px]">
                <label className="text-sm font-medium mb-1 block">Prioridade</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[150px]">
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="contacted">Contatado</SelectItem>
                    <SelectItem value="converted">Convertido</SelectItem>
                    <SelectItem value="ignored">Ignorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights Table */}
        <Card>
          <CardHeader>
            <CardTitle>Oportunidades de Conversão</CardTitle>
            <CardDescription>
              {filteredInsights.length} insight(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando insights...</div>
            ) : filteredInsights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum insight encontrado com os filtros selecionados.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo de Insight</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInsights.map((insight) => {
                    const Icon = getInsightIcon(insight.insight_type);
                    return (
                      <TableRow key={insight.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{insight.customer?.name || "N/A"}</div>
                            <div className="text-sm text-muted-foreground">{insight.customer?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {getInsightLabel(insight.insight_type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(insight.priority)}>
                            {getPriorityLabel(insight.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(insight.status)}>
                            {getStatusLabel(insight.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(insight.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => analyzeCustomer(insight.customer_id)}
                              disabled={analyzing === insight.customer_id}
                            >
                              {analyzing === insight.customer_id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Analisar
                                </>
                              )}
                            </Button>
                            {insight.status === "new" && (
                              <Button
                                size="sm"
                                onClick={() => updateInsightStatus(insight.id, "contacted")}
                              >
                                Marcar Contatado
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Insights;