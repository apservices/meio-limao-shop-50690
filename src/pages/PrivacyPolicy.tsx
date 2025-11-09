import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-serif font-semibold mb-6">Política de Privacidade</h1>
        
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border prose prose-sm max-w-none">
          <p className="text-muted-foreground mb-6">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <h2 className="text-xl font-serif font-semibold mb-4">1. Coleta de Dados</h2>
          <p className="mb-4 text-muted-foreground">
            A Meio Limão coleta informações fornecidas voluntariamente por você ao realizar cadastro, 
            fazer compras ou entrar em contato conosco. Os dados coletados incluem:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
            <li>Nome completo</li>
            <li>E-mail</li>
            <li>Telefone</li>
            <li>CPF</li>
            <li>Endereço de entrega</li>
            <li>Dados de pagamento (processados de forma segura por gateway)</li>
          </ul>

          <h2 className="text-xl font-serif font-semibold mb-4">2. Uso dos Dados</h2>
          <p className="mb-4 text-muted-foreground">
            Utilizamos seus dados pessoais para:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
            <li>Processar e entregar seus pedidos</li>
            <li>Enviar comunicações sobre seu pedido</li>
            <li>Melhorar nossos produtos e serviços</li>
            <li>Enviar ofertas e novidades (mediante sua autorização)</li>
            <li>Cumprir obrigações legais e fiscais</li>
          </ul>

          <h2 className="text-xl font-serif font-semibold mb-4">3. Compartilhamento de Dados</h2>
          <p className="mb-6 text-muted-foreground">
            Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de 
            marketing. Compartilhamos dados apenas com:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
            <li>Transportadoras para entrega dos produtos</li>
            <li>Gateways de pagamento para processar transações</li>
            <li>Autoridades legais quando exigido por lei</li>
          </ul>

          <h2 className="text-xl font-serif font-semibold mb-4">4. Segurança</h2>
          <p className="mb-6 text-muted-foreground">
            Utilizamos medidas de segurança técnicas e administrativas para proteger seus dados pessoais 
            contra acesso não autorizado, perda ou destruição. Todas as transações são processadas através 
            de conexões seguras (SSL).
          </p>

          <h2 className="text-xl font-serif font-semibold mb-4">5. Cookies</h2>
          <p className="mb-6 text-muted-foreground">
            Utilizamos cookies para melhorar sua experiência de navegação, personalizar conteúdo e analisar 
            o tráfego do site. Você pode desabilitar os cookies nas configurações do seu navegador.
          </p>

          <h2 className="text-xl font-serif font-semibold mb-4">6. Seus Direitos</h2>
          <p className="mb-4 text-muted-foreground">
            De acordo com a LGPD, você tem direito a:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Revogar consentimento para uso de dados</li>
            <li>Portabilidade de dados</li>
          </ul>

          <h2 className="text-xl font-serif font-semibold mb-4">7. Contato</h2>
          <p className="mb-6 text-muted-foreground">
            Para exercer seus direitos ou esclarecer dúvidas sobre nossa política de privacidade, 
            entre em contato conosco através do e-mail: privacidade@meiolimao.com.br
          </p>

          <div className="bg-primary/5 p-6 rounded-lg mt-8">
            <p className="text-sm text-muted-foreground">
              Esta política pode ser atualizada periodicamente. Recomendamos que você a revise regularmente 
              para se manter informada sobre como protegemos seus dados.
            </p>
          </div>
        </div>
      </main>
      
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default PrivacyPolicy;
