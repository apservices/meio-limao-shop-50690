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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-2.5 p-5 rounded-2xl bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-medium text-sm md:text-base text-foreground mb-0.5">
                    {benefit.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground font-light">
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
