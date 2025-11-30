import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Shield, Lock, CheckCircle2, CreditCard } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <img src="/icon-192.png" alt="Meio Limão" className="h-10 w-10" />
              <span className="text-2xl font-serif font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Meio Limão
              </span>
            </Link>
            <p className="text-muted-foreground mb-4">
              Moda feminina fresh e tropical. Peças únicas que celebram sua autenticidade e leveza.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/lojameiolimao/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/lojameiolimao"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="mailto:contato@meiolimao.shop"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-serif font-semibold mb-4">Loja</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  Todos os Produtos
                </Link>
              </li>
              <li>
                <Link to="/shop?new=true" className="text-muted-foreground hover:text-primary transition-colors">
                  Novidades
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  Mais Vendidos
                </Link>
              </li>
              <li>
                <Link to="/guia-de-medidas" className="text-muted-foreground hover:text-primary transition-colors">
                  Guia de Medidas
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-serif font-semibold mb-4">Ajuda</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/trocas" className="text-muted-foreground hover:text-primary transition-colors">
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors">
                  Termos de Compra
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/seguranca" className="text-muted-foreground hover:text-primary transition-colors">
                  Segurança e Proteção de Dados
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/5511973500848"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Fale Conosco
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Certificações e Selos de Segurança */}
        <div className="border-t pt-8 pb-8">
          <div className="text-center mb-6">
            <h3 className="font-serif font-semibold text-lg mb-2">Ambiente 100% Seguro</h3>
            <p className="text-sm text-muted-foreground">Suas informações protegidas com os mais altos padrões de segurança</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-sm mb-1">SSL Certificado</h4>
              <p className="text-xs text-muted-foreground">Criptografia de ponta a ponta</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Site Seguro</h4>
              <p className="text-xs text-muted-foreground">Proteção contra fraudes</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-sm mb-1">PCI Compliance</h4>
              <p className="text-xs text-muted-foreground">Pagamento seguro</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Dados Protegidos</h4>
              <p className="text-xs text-muted-foreground">LGPD em conformidade</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Meio Limão. Todos os direitos reservados.</p>
          <p className="mt-2">CNPJ: 07.704.241/0001-60 | contato@meiolimao.shop</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
