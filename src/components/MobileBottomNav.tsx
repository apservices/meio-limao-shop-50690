import { Home, Search, ShoppingBag, User, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Buscar", path: "/shop" },
    { icon: ShoppingBag, label: "Carrinho", path: "/cart" },
    { icon: User, label: "Conta", path: "/account" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
        
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center flex-1 h-full text-primary transition-colors hover:text-primary/80"
        >
          <MessageCircle className="h-5 w-5 fill-current" />
          <span className="text-xs mt-1">WhatsApp</span>
        </a>
      </nav>
    </div>
  );
};

export default MobileBottomNav;
