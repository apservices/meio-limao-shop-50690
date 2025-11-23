import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ruler } from "lucide-react";

const SizeGuide = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ruler className="h-4 w-4" />
          Guia de Medidas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Guia de Medidas</DialogTitle>
          <DialogDescription className="sr-only">
            Tabela de medidas e instruções para encontrar o tamanho ideal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Como medir?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Busto:</strong> Meça na parte mais cheia do busto</li>
              <li>• <strong>Cintura:</strong> Meça na parte mais fina da cintura</li>
              <li>• <strong>Quadril:</strong> Meça na parte mais larga do quadril</li>
              <li>• <strong>Comprimento:</strong> Da gola até a barra</li>
            </ul>
          </div>

          <div className="overflow-x-auto">
            <h3 className="font-semibold mb-3">Tabela de Medidas (cm)</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Tamanho</th>
                  <th className="border p-2 text-center">Busto</th>
                  <th className="border p-2 text-center">Cintura</th>
                  <th className="border p-2 text-center">Quadril</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-medium">PP</td>
                  <td className="border p-2 text-center">80-84</td>
                  <td className="border p-2 text-center">60-64</td>
                  <td className="border p-2 text-center">86-90</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">P</td>
                  <td className="border p-2 text-center">84-88</td>
                  <td className="border p-2 text-center">64-68</td>
                  <td className="border p-2 text-center">90-94</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">M</td>
                  <td className="border p-2 text-center">88-92</td>
                  <td className="border p-2 text-center">68-72</td>
                  <td className="border p-2 text-center">94-98</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">G</td>
                  <td className="border p-2 text-center">92-96</td>
                  <td className="border p-2 text-center">72-76</td>
                  <td className="border p-2 text-center">98-102</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">GG</td>
                  <td className="border p-2 text-center">96-100</td>
                  <td className="border p-2 text-center">76-80</td>
                  <td className="border p-2 text-center">102-106</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Dica:</strong> Em caso de dúvida entre dois tamanhos, recomendamos escolher o maior para maior conforto. 
              Caso precise de ajuda, entre em contato pelo WhatsApp!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeGuide;
