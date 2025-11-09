import { Truck, RefreshCw, Lock } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    {
      icon: Truck,
      title: "Frete Rápido",
      description: "Entrega em todo Brasil",
    },
    {
      icon: RefreshCw,
      title: "Troca Fácil",
      description: "Até 30 dias para trocar",
    },
    {
      icon: Lock,
      title: "Pagamento Seguro",
      description: "Seus dados protegidos",
    },
  ];

  return (
    <section className="py-8 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div key={badge.title} className="flex items-center gap-4 text-center md:text-left justify-center md:justify-start">
              <badge.icon className="h-10 w-10 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold">{badge.title}</h3>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
