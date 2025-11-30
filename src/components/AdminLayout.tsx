import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Package, 
  LayoutGrid, 
  FolderOpen, 
  ShoppingCart, 
  Tag, 
  Users, 
  BarChart3,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { signOut } = useAuth();
  const location = useLocation();

  const tabs = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/products", icon: Package, label: "Produtos" },
    { path: "/admin/categories", icon: LayoutGrid, label: "Categorias" },
    { path: "/admin/collections", icon: FolderOpen, label: "Coleções" },
    { path: "/admin/orders", icon: ShoppingCart, label: "Pedidos" },
    { path: "/admin/coupons", icon: Tag, label: "Cupons" },
    { path: "/admin/customers", icon: Users, label: "Clientes" },
    { path: "/admin/insights", icon: BarChart3, label: "Insights" },
    { path: "/admin/reports", icon: BarChart3, label: "Relatórios" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary">Meio Limão</h1>
              <span className="text-sm text-muted-foreground">Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  Ver Loja
                </Button>
              </Link>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
          
          <nav className="flex gap-1 overflow-x-auto pb-px -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
