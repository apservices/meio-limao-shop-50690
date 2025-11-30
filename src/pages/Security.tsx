import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Shield, Lock, CreditCard, Server, Eye, UserCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet";

const Security = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: "Certificado SSL/TLS",
      description: "Todas as conexões são criptografadas com protocolo HTTPS usando certificação SSL/TLS de 256 bits, garantindo que seus dados nunca sejam interceptados."
    },
    {
      icon: Lock,
      title: "Criptografia de Dados",
      description: "Seus dados pessoais são armazenados com criptografia de ponta a ponta. Senhas são protegidas com hash bcrypt e nunca são armazenadas em texto plano."
    },
    {
      icon: CreditCard,
      title: "Pagamentos Seguros",
      description: "Processamos pagamentos através do Mercado Pago, certificado PCI DSS Level 1, o mais alto padrão de segurança da indústria de pagamentos."
    },
    {
      icon: Server,
      title: "Infraestrutura Confiável",
      description: "Nossa infraestrutura é hospedada em servidores seguros com backup automático, monitoramento 24/7 e proteção contra ataques DDoS."
    },
    {
      icon: Eye,
      title: "Privacidade Garantida",
      description: "Nunca compartilhamos seus dados com terceiros sem autorização. Somos 100% compatíveis com a Lei Geral de Proteção de Dados (LGPD)."
    },
    {
      icon: UserCheck,
      title: "Autenticação Segura",
      description: "Sistema de autenticação com tokens JWT, proteção contra força bruta e verificação em duas etapas disponível para maior segurança."
    }
  ];

  const complianceItems = [
    { icon: CheckCircle, text: "Certificado SSL/TLS Ativo" },
    { icon: CheckCircle, text: "Compatível com LGPD" },
    { icon: CheckCircle, text: "PCI DSS Compliant" },
    { icon: CheckCircle, text: "Política de Privacidade Clara" },
    { icon: CheckCircle, text: "Backup Automático Diário" },
    { icon: CheckCircle, text: "Monitoramento de Segurança 24/7" }
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Segurança e Certificações - Meio Limão</title>
        <meta name="description" content="Sua segurança é nossa prioridade. Conheça todas as medidas de proteção e certificações do site Meio Limão para garantir uma compra 100% segura." />
      </Helmet>

      <Navbar />
      
      <main className="container mx-auto px-4 py-12 pb-24 md:pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-4">
            Sua Segurança é Nossa Prioridade
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Investimos em tecnologia de ponta para garantir que suas informações estejam sempre protegidas. 
            Compre com total tranquilidade.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="bg-primary/5 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-serif font-semibold text-center mb-6">
            Certificações e Conformidades
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {complianceItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-background rounded-lg p-4">
                <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-card rounded-2xl p-8 shadow-sm border">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="h-8 w-8 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-serif font-semibold mb-2">
                Dicas de Segurança para Você
              </h2>
              <p className="text-muted-foreground">
                Sua segurança depende também de você. Siga estas recomendações:
              </p>
            </div>
          </div>
          
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Sempre verifique se o site possui o cadeado 🔒 na barra de endereço antes de inserir dados pessoais</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Nunca compartilhe sua senha com ninguém, nem mesmo com nossa equipe</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Use senhas fortes com letras maiúsculas, minúsculas, números e símbolos</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Evite acessar sua conta em computadores públicos ou redes Wi-Fi desconhecidas</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Mantenha seu antivírus e navegador sempre atualizados</span>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold mb-3">Dúvidas sobre Segurança?</h3>
          <p className="text-muted-foreground mb-4">
            Nossa equipe está pronta para esclarecer qualquer questão sobre a proteção dos seus dados.
          </p>
          <a
            href="/contato"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Entre em Contato
          </a>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default Security;