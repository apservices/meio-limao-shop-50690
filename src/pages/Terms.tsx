import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-serif font-semibold mb-6">Termos e Condições de Compra</h1>
        
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border prose prose-sm max-w-none">
          <p className="text-muted-foreground mb-6">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <h2 className="text-xl font-serif font-semibold mb-4">1. Aceitação dos Termos</h2>
          <p className="mb-6 text-muted-foreground">
            Ao utilizar o site da Meio Limão e realizar compras, você concorda com estes termos e condições. 
            Caso não concorde, por favor, não utilize nossos serviços.
          </p>

          <h2 className="text-xl font-serif font-semibold mb-4">2. Produtos e Preços</h2>
          <p className="mb-4 text-muted-foreground">
            Fazemos o possível para exibir com precisão cores e detalhes dos produtos, porém não garantimos 
            que a exibição em seu dispositivo seja completamente precisa.
          </p>
          <p className="mb-6 text-muted-foreground">
            Os preços estão sujeitos a alterações sem aviso prévio. O preço válido é o exibido no momento 
            da finalização da compra.
          </p>

          <h2 className="text-xl font-serif font-semibold mb-4">3. Pedidos e Pagamento</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
            <li>Aceitamos pagamento via PIX e cartão de crédito</li>
            <li>Parcelamento em até 3x sem juros ou até 6x com juros no cartão de crédito</li>
            <li>Reservamo-nos o direito de recusar ou cancelar pedidos em caso de suspeita de fraude</li>
            <li>Após confirmação do pagamento, você receberá um e-mail com os detalhes do pedido</li>
          </ul>

          <h2 className="text-xl font-serif font-semibold mb-4">4. Entrega</h2>
          <p className="mb-4 text-muted-foreground">
            O prazo de entrega começa a contar após a confirmação do pagamento e varia de acordo com a 
            região de destino e modalidade de frete escolhida.
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
            <li>Prazo estimado: 5 a 15 dias úteis</li>
            <li>Realizamos envios para todo o Brasil</li>
            <li>O código de rastreamento será enviado por e-mail</li>
            <li>Não nos responsabilizamos por atrasos causados pelos Correios ou transportadoras</li>
          </ul>

          <h2 className="text-xl font-serif font-semibold mb-4">5. Trocas e Devoluções</h2>
          <p className="mb-6 text-muted-foreground">
            Consulte nossa <a href="/trocas" className="text-primary hover:underline">Política de Trocas e Devoluções</a> para 
            informações detalhadas sobre como proceder.
          </p>

          <h2 className="text-xl font-serif font-semibold mb-4">6. Direito de Arrependimento</h2>
          <p className="mb-6 text-muted-foreground">
            Conforme o Código de Defesa do Consumidor, você pode desistir da compra em até 7 dias corridos 
            após o recebimento do produto, com devolução integral do valor pago.
          </p>

          <h2 className="text-xl font-serif font-semibold mb-4">7. Propriedade Intelectual</h2>
          <p className="mb-6 text-muted-foreground">
            Todo o conteúdo do site, incluindo imagens, textos, logos e design, é de propriedade exclusiva 
            da Meio Limão e está protegido por leis de direitos autorais.
          </p>

          <h2 className="text-xl font-serif font-semibold mb-4">8. Limitação de Responsabilidade</h2>
          <p className="mb-6 text-muted-foreground">
            Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais resultantes do uso 
            ou impossibilidade de uso do site ou produtos.
          </p>

          <h2 className="text-xl font-serif font-semibold mb-4">9. Contato</h2>
          <p className="mb-4 text-muted-foreground">
            Para dúvidas sobre estes termos, entre em contato:
          </p>
          <ul className="list-none mb-6 space-y-2 text-muted-foreground">
            <li>📧 E-mail: contato@meiolimao.com.br</li>
            <li>📱 WhatsApp: (11) 99999-9999</li>
          </ul>

          <div className="bg-primary/5 p-6 rounded-lg mt-8">
            <p className="text-sm text-muted-foreground">
              Estes termos e condições são regidos pelas leis brasileiras. Qualquer disputa será resolvida 
              no foro da comarca de São Paulo/SP.
            </p>
          </div>
        </div>
      </main>
      
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default Terms;
