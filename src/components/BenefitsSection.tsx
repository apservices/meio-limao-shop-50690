import { Truck, Award, ShieldCheck, CreditCard } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Frete Rápido",
    description: "Entrega em todo Brasil",
  },
  {
    icon: Award,
    title: "Qualidade Garantida",
    description: "Produtos selecionados",
  },
  {
    icon: ShieldCheck,
    title: "Compra Segura",
    description: "Dados protegidos",
  },
  {
    icon: CreditCard,
    title: "Parcelamento",
    description: "Até 6x sem juros",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl bg-card hover:shadow-md transition-shadow duration-300"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
