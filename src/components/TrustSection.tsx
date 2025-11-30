import { Shield, RefreshCw, Truck, Lock, Award, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const TrustSection = () => {
  const guarantees = [
    {
      icon: RefreshCw,
      title: "Troca Facilitada",
      description: "30 dias para trocas e devoluções sem complicação"
    },
    {
      icon: Shield,
      title: "Compra Protegida",
      description: "Seus dados seguros com criptografia de ponta"
    },
    {
      icon: Truck,
      title: "Entrega Rastreada",
      description: "Acompanhe seu pedido em tempo real"
    },
    {
      icon: Award,
      title: "Qualidade Garantida",
      description: "Tecidos premium e acabamento impecável"
    }
  ];

  const commitments = [
    "Tecidos selecionados de alta qualidade",
    "Modelagem pensada para o corpo brasileiro",
    "Produção sustentável e consciente",
    "Embalagem eco-friendly",
    "Atendimento personalizado",
    "Garantia de satisfação"
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="text-primary font-medium uppercase tracking-wider mb-4 text-sm">
            Sua Confiança É Nosso Compromisso
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Compre com Tranquilidade
          </h2>
          <p className="text-lg text-muted-foreground">
            Na Meio Limão, sua experiência é nossa prioridade. Desde a escolha até a entrega, cuidamos de cada detalhe.
          </p>
        </div>

        {/* Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {guarantees.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Commitments Banner */}
        <div className="bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 rounded-3xl p-8 md:p-12 border border-primary/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <Lock className="h-8 w-8 text-primary" />
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                Nossos Compromissos com Você
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commitments.map((commitment, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">{commitment}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center space-y-4">
              <p className="text-muted-foreground text-sm">
                Dúvidas? Estamos aqui para ajudar
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/exchange-policy" className="text-primary hover:underline font-medium">
                  Política de Trocas
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  Privacidade
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link to="/contact" className="text-primary hover:underline font-medium">
                  Fale Conosco
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
