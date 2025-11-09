import { useState } from "react";
import Navbar from "@/components/Navbar";
import ShippingCalculator from "@/components/ShippingCalculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TestShipping = () => {
  return (
    <div className="min-h-screen bg-accent/5">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-serif font-semibold mb-8 text-center">
            Teste de Cálculo de Frete
          </h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Melhor Envio - Integração Ativa</CardTitle>
              <CardDescription>
                Digite um CEP válido para calcular o frete real usando a API do Melhor Envio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShippingCalculator />
              
              <div className="mt-8 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Instruções:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Digite um CEP válido (apenas números, 8 dígitos)</li>
                  <li>Clique em "OK" para calcular</li>
                  <li>Serão exibidas as opções disponíveis (PAC, SEDEX, etc.)</li>
                  <li>Preços e prazos são calculados em tempo real</li>
                </ul>
              </div>
              
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <h3 className="font-semibold mb-2 text-primary">CEPs para teste:</h3>
                <ul className="text-sm space-y-1">
                  <li><strong>01310100</strong> - São Paulo, SP (centro)</li>
                  <li><strong>22250040</strong> - Rio de Janeiro, RJ</li>
                  <li><strong>30130000</strong> - Belo Horizonte, MG</li>
                  <li><strong>80010000</strong> - Curitiba, PR</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TestShipping;
