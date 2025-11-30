import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, signOut, isAdmin } = useAuth();

  const initials = user?.email ? user.email.charAt(0).toUpperCase() : "";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/icon-192.png" alt="Meio Limão" className="h-10 w-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Meio Limão
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shop" className="text-sm font-medium hover:text-primary transition-colors">
              Loja
            </Link>
            <Link to="/novidades" className="text-sm font-medium hover:text-primary transition-colors">
              Novidades
            </Link>
            <Link to="/looks" className="text-sm font-medium hover:text-primary transition-colors">
              Looks
            </Link>
            <Link to="/sobre" className="text-sm font-medium hover:text-primary transition-colors">
              Sobre
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              {isSearchOpen ? (
                <div className="flex items-center space-x-2">
                  <Input
                    type="search"
                    placeholder="Buscar produtos..."
                    className="w-64"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link to="/account#wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full border">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{initials || "?"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/account">Minha conta</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard">Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => signOut()}>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" className="hidden md:inline-flex" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-8">
                  <Link
                    to="/shop"
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    Loja
                  </Link>
                  <Link
                    to="/novidades"
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    Novidades
                  </Link>
                  <Link
                    to="/looks"
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    Looks
                  </Link>
                  <Link
                    to="/sobre"
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    Sobre
                  </Link>
                  <div className="pt-4 border-t">
                    {user ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Conectado como {user.email}</p>
                        <div className="flex gap-2">
                          <Button asChild className="flex-1" size="sm">
                            <Link to="/account">Minha conta</Link>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => signOut()}>
                            Sair
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button asChild className="w-full">
                        <Link to="/login">Entrar</Link>
                      </Button>
                    )}
                  </div>
                  <div className="pt-4 border-t">
                    <Input type="search" placeholder="Buscar produtos..." />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
