import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Julia Santos",
      avatar: "https://i.pravatar.cc/150?img=1",
      rating: 5,
      comment: "Apaixonada pelas peças! Qualidade impecável e o tecido é super confortável. Já sou cliente fiel! 🍋",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop",
    },
    {
      id: 2,
      name: "Mariana Costa",
      avatar: "https://i.pravatar.cc/150?img=5",
      rating: 5,
      comment: "Recebi super rápido e a embalagem é linda! O vestido ficou perfeito, exatamente como nas fotos.",
      image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=300&h=300&fit=crop",
    },
    {
      id: 3,
      name: "Beatriz Oliveira",
      avatar: "https://i.pravatar.cc/150?img=9",
      rating: 5,
      comment: "Atendimento perfeito pelo WhatsApp! Me ajudaram a escolher o tamanho ideal. Adorei a experiência!",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=300&fit=crop",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? "fill-primary text-primary" : "text-muted"}`}
      />
    ));
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
            Quem veste, aprova
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Histórias reais de quem já se apaixonou pelas nossas peças
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-card rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <div className="flex mt-1">{renderStars(testimonial.rating)}</div>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">{testimonial.comment}</p>
              
              <img
                src={testimonial.image}
                alt={`Foto de ${testimonial.name}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
