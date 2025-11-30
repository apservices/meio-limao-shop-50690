import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { CheckoutFailurePage, CheckoutPendingPage, CheckoutSuccessPage } from "./pages/CheckoutStatusPage";
import Account from "./pages/Account";
import SizeGuide from "./pages/SizeGuide";
import ExchangePolicy from "./pages/ExchangePolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Collections from "./pages/admin/Collections";
import Orders from "./pages/admin/Orders";
import Coupons from "./pages/admin/Coupons";
import Customers from "./pages/admin/Customers";
import Reports from "./pages/admin/Reports";
import NewArrivals from "./pages/NewArrivals";
import Looks from "./pages/Looks";
import AdminLooks from "./pages/admin/Looks";
import Security from "./pages/Security";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/produto/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/checkout/pending" element={<CheckoutPendingPage />} />
            <Route path="/checkout/failure" element={<CheckoutFailurePage />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/novidades" element={<NewArrivals />} />
            <Route path="/looks" element={<Looks />} />
            <Route path="/account" element={<Account />} />
            <Route path="/guia-de-medidas" element={<SizeGuide />} />
            <Route path="/trocas" element={<ExchangePolicy />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/seguranca" element={<Security />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/collections"
              element={
                <ProtectedRoute>
                  <Collections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <ProtectedRoute>
                  <Coupons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/looks"
              element={
                <ProtectedRoute>
                  <AdminLooks />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
