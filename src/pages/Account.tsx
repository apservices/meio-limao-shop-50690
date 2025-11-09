import { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Heart, User, MapPin } from "lucide-react";

const Account = () => {
  const [isLoggedIn] = useState(false); // Mudar para true quando implementar auth

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen">
        <Navbar />
        
        <main className="container mx-auto px-4 py-16 max-w-md">
          <div className="bg-card rounded-2xl p-8 shadow-sm border">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🍋</div>
              <h1 className="text-2xl font-serif font-semibold mb-2">Entrar</h1>
              <p className="text-muted-foreground">
                Acesse sua conta para acompanhar pedidos e favoritos
              </p>
            </div>
            
            <form className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com" />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••" />
              </div>
              
              <Button type="submit" className="w-full" size="lg">
                Entrar
              </Button>
              
              <div className="text-center">
                <a href="#" className="text-sm text-primary hover:underline">
                  Esqueceu sua senha?
                </a>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>
              
              <Button type="button" variant="outline" className="w-full" size="lg">
                Criar nova conta
              </Button>
            </form>
          </div>
        </main>
        
        <MobileBottomNav />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-serif font-semibold mb-8">Minha Conta</h1>
        
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Favoritos</span>
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Endereços</span>
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="space-y-4">
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-serif font-semibold mb-2">Nenhum pedido ainda</h2>
              <p className="text-muted-foreground mb-6">
                Quando você fizer uma compra, ela aparecerá aqui
              </p>
              <Button asChild>
                <a href="/shop">Começar a comprar</a>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="wishlist" className="space-y-4">
            <div className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-serif font-semibold mb-2">Lista vazia</h2>
              <p className="text-muted-foreground mb-6">
                Salve seus produtos favoritos aqui
              </p>
              <Button asChild>
                <a href="/shop">Explorar produtos</a>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="addresses">
            <div className="bg-card rounded-2xl p-6 shadow-sm border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-semibold">Meus Endereços</h2>
                <Button>Adicionar Endereço</Button>
              </div>
              
              <div className="text-center py-8 text-muted-foreground">
                Nenhum endereço cadastrado
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="profile">
            <div className="bg-card rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-serif font-semibold mb-6">Dados Pessoais</h2>
              
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" defaultValue="Maria Silva" />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" defaultValue="maria@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" defaultValue="(11) 99999-9999" />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" defaultValue="000.000.000-00" />
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-4">Alterar Senha</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                </div>
                
                <Button type="submit" size="lg">Salvar Alterações</Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default Account;
