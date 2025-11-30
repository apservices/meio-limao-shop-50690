import { Shield, Lock, CreditCard, CheckCircle2 } from "lucide-react";

const SecurityBadges = () => {
  const badges = [
    {
      icon: Shield,
      title: "Site Seguro",
      description: "Certificado SSL/TLS Ativo"
    },
    {
      icon: Lock,
      title: "Dados Protegidos",
      description: "Criptografia de Ponta a Ponta"
    },
    {
      icon: CreditCard,
      title: "Pagamento Seguro",
      description: "Processamento PCI Compliant"
    },
    {
      icon: CheckCircle2,
      title: "Compra Garantida",
      description: "100% Seguro e Protegido"
    }
  ];

  return (
    <div className="bg-accent/5 py-8 border-y">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-accent/10 transition-colors"
            >
              <badge.icon className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityBadges;