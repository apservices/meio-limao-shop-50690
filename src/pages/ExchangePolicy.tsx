import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

const ExchangePolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-serif font-semibold mb-6">Trocas e Devoluções</h1>
        
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border prose prose-sm max-w-none">
          <h2 className="text-xl font-serif font-semibold mb-4">Nossa Política</h2>
          <p className="text-muted-foreground mb-6">
            Queremos que você se sinta completamente satisfeita com sua compra. Por isso, oferecemos 
            condições facilitadas para trocas e devoluções.
          </p>

          <h3 className="text-lg font-semibold mb-3">Prazo para Trocas</h3>
          <p className="mb-4">
            Você tem até <strong>30 dias</strong> após o recebimento do produto para solicitar troca ou devolução.
          </p>

          <h3 className="text-lg font-semibold mb-3">Condições para Troca</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
            <li>O produto deve estar sem uso, com etiquetas originais</li>
            <li>Embalagem original preservada</li>
            <li>Acompanhado da nota fiscal</li>
            <li>Sem sinais de lavagem ou alterações</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3">Como Solicitar</h3>
          <ol className="list-decimal pl-6 mb-6 space-y-2 text-muted-foreground">
            <li>Entre em contato pelo WhatsApp (11) 97350-0848</li>
            <li>Informe o número do pedido e motivo da troca</li>
            <li>Nossa equipe enviará as instruções de postagem</li>
            <li>Após recebermos o produto, processaremos a troca em até 5 dias úteis</li>
          </ol>

          <h3 className="text-lg font-semibold mb-3">Frete de Devolução</h3>
          <p className="mb-4">
            O frete de devolução é por conta do cliente, exceto em casos de:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
            <li>Produto com defeito de fabricação</li>
            <li>Produto errado enviado</li>
            <li>Produto danificado no transporte</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3">Reembolso</h3>
          <p className="mb-6 text-muted-foreground">
            Caso não deseje realizar troca, o valor será reembolsado através da mesma forma de pagamento 
            utilizada na compra, em até 10 dias úteis após recebermos o produto de volta.
          </p>

          <div className="bg-primary/5 p-6 rounded-lg mt-8">
            <h3 className="text-lg font-semibold mb-2">Dúvidas?</h3>
            <p className="text-muted-foreground">
              Nossa equipe está pronta para te ajudar! Entre em contato pelo WhatsApp e 
              resolveremos juntas a melhor solução para você.
            </p>
          </div>
        </div>
      </main>
      
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default ExchangePolicy;
