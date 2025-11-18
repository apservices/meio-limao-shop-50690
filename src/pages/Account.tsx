import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Heart, User, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/contexts/WishlistContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(3, "Informe seu nome completo"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(8, "Telefone inválido").optional().or(z.literal("")),
  document: z
    .string()
    .regex(/^(\d{11}|\d{14})$/, "Documento deve ter 11 ou 14 dígitos")
    .optional()
    .or(z.literal("")),
});

const addressSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nome obrigatório"),
  label: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  zipcode: z.string().min(5, "CEP obrigatório"),
  state: z.string().min(2, "Estado obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  district: z.string().min(2, "Bairro obrigatório"),
  street: z.string().min(3, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional().or(z.literal("")),
  country: z.string().min(2).default("Brasil"),
  isDefault: z.boolean().optional(),
});

type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];
type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items?: Database["public"]["Tables"]["order_items"]["Row"][];
};

type AddressFormState = {
  id?: string | null;
  name: string;
  label: string;
  phone: string;
  zipcode: string;
  state: string;
  city: string;
  district: string;
  street: string;
  number: string;
  complement: string;
  country: string;
  isDefault: boolean;
};

const emptyAddress: AddressFormState = {
  id: null,
  name: "",
  label: "",
  phone: "",
  zipcode: "",
  state: "",
  city: "",
  district: "",
  street: "",
  number: "",
  complement: "",
  country: "Brasil",
  isDefault: false,
};

const Account = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { toast } = useToast();
  const location = useLocation();
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    document: "",
  });
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddress);
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    if (location.hash === "#wishlist") {
      setActiveTab("wishlist");
    } else if (location.hash === "#addresses") {
      setActiveTab("addresses");
    } else if (location.hash === "#profile") {
      setActiveTab("profile");
    } else {
      setActiveTab("orders");
    }
  }, [location.hash]);

  const {
    data: profileData,
    isLoading: profileLoading,
  } = useQuery<ProfileRow | null>({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      return data ?? null;
    },
    enabled: !!user?.id,
  });

  const {
    data: customer,
    isLoading: customerLoading,
    refetch: refetchCustomer,
  } = useQuery<CustomerRow | null>({
    queryKey: ["customer", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) return data;

      const { data: created, error: insertError } = await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          email: user.email ?? "",
          name: (user.user_metadata as { full_name?: string })?.full_name ?? user.email ?? "",
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return created;
    },
  });

  const {
    data: addresses,
    isLoading: addressesLoading,
    refetch: refetchAddresses,
  } = useQuery<AddressRow[]>({
    queryKey: ["addresses", customer?.id],
    enabled: !!customer?.id,
    queryFn: async () => {
      if (!customer?.id) return [];
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const {
    data: orders,
    isLoading: ordersLoading,
  } = useQuery<OrderRow[]>({
    queryKey: ["orders", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!profileInitialized && (profileData || customer)) {
      setProfileForm({
        fullName:
          profileData?.full_name || customer?.name || (user?.user_metadata as { full_name?: string })?.full_name || "",
        email: profileData?.email || customer?.email || user?.email || "",
        phone: customer?.phone || "",
        document: customer?.document || "",
      });
      setProfileInitialized(true);
    }
  }, [profileData, customer, profileInitialized, user]);

  const profileMutation = useMutation({
    mutationFn: async (values: typeof profileForm) => {
      if (!user?.id || !customer?.id) throw new Error("Usuário não encontrado");
      const parsed = profileSchema.parse(values);

      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: parsed.fullName,
        email: parsed.email,
      });

      await supabase.from("customers").update({
        name: parsed.fullName,
        email: parsed.email,
        phone: parsed.phone || null,
        document: parsed.document || null,
      }).eq("id", customer.id);
    },
    onSuccess: async () => {
      await Promise.all([refetchCustomer(), supabase.auth.getUser()]);
      toast({ title: "Dados atualizados", description: "Suas informações foram salvas." });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar seus dados. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const addressMutation = useMutation({
    mutationFn: async (values: AddressFormState) => {
      if (!customer?.id) throw new Error("Cliente não encontrado");
      const parsed = addressSchema.parse(values);
      const payload = {
        name: parsed.name,
        label: parsed.label || null,
        phone: parsed.phone || null,
        zipcode: parsed.zipcode.replace(/\D/g, ""),
        state: parsed.state.toUpperCase(),
        city: parsed.city,
        district: parsed.district,
        street: parsed.street,
        number: parsed.number,
        complement: parsed.complement || null,
        country: parsed.country,
        is_default: parsed.isDefault ?? false,
      };

      if (parsed.id) {
        const { error } = await supabase
          .from("addresses")
          .update(payload)
          .eq("id", parsed.id)
          .eq("customer_id", customer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("addresses").insert({
          ...payload,
          customer_id: customer.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      setAddressForm(emptyAddress);
      await refetchAddresses();
      toast({ title: "Endereço salvo", description: "Seu endereço foi atualizado." });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Erro ao salvar endereço",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    []
  );

  const formatDate = (date: string | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(date));
  };

  const handleAddressEdit = (address: AddressRow) => {
    setAddressForm({
      id: address.id,
      name: address.name,
      label: address.label || "",
      phone: address.phone || "",
      zipcode: address.zipcode,
      state: address.state,
      city: address.city,
      district: address.district,
      street: address.street,
      number: address.number,
      complement: address.complement || "",
      country: address.country || "Brasil",
      isDefault: !!address.is_default,
    });
  };

  if (authLoading || profileLoading || customerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando sua conta...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-16 max-w-md">
          <div className="bg-card rounded-2xl p-8 shadow-sm border text-center space-y-6">
            <div>
              <div className="text-5xl mb-4">🍋</div>
              <h1 className="text-2xl font-serif font-semibold mb-2">Entre na sua conta</h1>
              <p className="text-muted-foreground">
                Faça login para acompanhar pedidos, endereços e favoritos.
              </p>
            </div>
            <div className="space-y-3">
              <Button asChild size="lg" className="w-full">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/signup">Criar conta</Link>
              </Button>
            </div>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-muted-foreground">Conectado como</p>
            <h1 className="text-3xl font-serif font-semibold">{profileForm.fullName || user.email}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            Sair da conta
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

          <TabsContent value="orders" className="space-y-4" id="orders">
            {ordersLoading ? (
              <div className="text-center py-16 text-muted-foreground">Carregando pedidos...</div>
            ) : orders && orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="bg-card rounded-2xl p-6 shadow-sm border">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pedido #{order.order_number ?? order.id.slice(0, 6)}</p>
                      <h3 className="text-xl font-serif font-semibold">
                        {formatCurrency.format((order.total_cents ?? Math.round(order.total * 100)) / 100)}
                      </h3>
                      <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                        <span>{item.name_snapshot}</span>
                        <span>x{item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-serif font-semibold mb-2">Nenhum pedido ainda</h2>
                <p className="text-muted-foreground mb-6">
                  Assim que você fizer uma compra, ela aparecerá aqui.
                </p>
                <Button asChild>
                  <Link to="/shop">Começar a comprar</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-4" id="wishlist">
            {wishlistItems.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-serif font-semibold mb-2">Lista vazia</h2>
                <p className="text-muted-foreground mb-6">Salve seus produtos favoritos para lembrar depois.</p>
                <Button asChild>
                  <Link to="/shop">Explorar produtos</Link>
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="bg-card rounded-2xl p-4 border">
                    <div className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <p className="font-serif font-semibold mt-2">{formatCurrency.format(item.price)}</p>
                        <Button asChild variant="outline" size="sm" className="mt-3">
                          <Link to={`/produto/${item.id}`}>Ver produto</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addresses" id="addresses">
            <div className="bg-card rounded-2xl p-6 shadow-sm border space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif font-semibold">Meus Endereços</h2>
                  <p className="text-sm text-muted-foreground">Cadastre e gerencie seus endereços de entrega.</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setAddressForm(emptyAddress)}
                >
                  Novo endereço
                </Button>
              </div>

              <div className="space-y-4">
                {addressesLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando endereços...</p>
                ) : addresses && addresses.length > 0 ? (
                  addresses.map((address) => (
                    <div key={address.id} className="border rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="font-semibold">{address.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {address.street}, {address.number} - {address.district}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.city}/{address.state} • CEP {address.zipcode}
                        </p>
                        {address.is_default && <Badge className="mt-2">Padrão</Badge>}
                      </div>
                      <Button variant="ghost" onClick={() => handleAddressEdit(address)}>
                        Editar
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>
                )}
              </div>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  addressMutation.mutate(addressForm);
                }}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address-name">Nome</Label>
                    <Input
                      id="address-name"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address-label">Identificação</Label>
                    <Input
                      id="address-label"
                      value={addressForm.label}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address-phone">Telefone</Label>
                    <Input
                      id="address-phone"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address-zipcode">CEP</Label>
                    <Input
                      id="address-zipcode"
                      value={addressForm.zipcode}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, zipcode: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address-state">Estado</Label>
                    <Input
                      id="address-state"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, state: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address-city">Cidade</Label>
                    <Input
                      id="address-city"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address-district">Bairro</Label>
                    <Input
                      id="address-district"
                      value={addressForm.district}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, district: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address-street">Rua</Label>
                    <Input
                      id="address-street"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, street: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address-number">Número</Label>
                    <Input
                      id="address-number"
                      value={addressForm.number}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, number: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address-complement">Complemento</Label>
                    <Input
                      id="address-complement"
                      value={addressForm.complement}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, complement: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="address-default"
                    checked={addressForm.isDefault}
                    onCheckedChange={(checked) => setAddressForm((prev) => ({ ...prev, isDefault: checked }))}
                  />
                  <Label htmlFor="address-default">Definir como endereço padrão</Label>
                </div>

                <div className="flex gap-3">
                  {addressForm.id && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setAddressForm(emptyAddress)}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button type="submit" disabled={addressMutation.isPending}>
                    {addressForm.id ? "Atualizar endereço" : "Salvar endereço"}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="profile" id="profile">
            <div className="bg-card rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-serif font-semibold mb-6">Dados Pessoais</h2>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  profileMutation.mutate(profileForm);
                }}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profile-name">Nome Completo</Label>
                    <Input
                      id="profile-name"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-email">E-mail</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-phone">Telefone</Label>
                    <Input
                      id="profile-phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-document">CPF/CNPJ</Label>
                    <Input
                      id="profile-document"
                      value={profileForm.document}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, document: e.target.value }))}
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" disabled={profileMutation.isPending}>
                  Salvar alterações
                </Button>
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
