import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SizeGuide = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-serif font-semibold mb-6">Guia de Medidas</h1>
        
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border">
          <p className="text-muted-foreground mb-8">
            Para escolher o tamanho ideal, meça suas medidas corporais e compare com nossa tabela.
            Em caso de dúvidas, nossa equipe está disponível pelo WhatsApp para ajudar!
          </p>

          <Tabs defaultValue="tops" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="tops">Blusas & Tops</TabsTrigger>
              <TabsTrigger value="bottoms">Calças & Saias</TabsTrigger>
              <TabsTrigger value="dresses">Vestidos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tops">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Busto (cm)</TableHead>
                    <TableHead>Cintura (cm)</TableHead>
                    <TableHead>Quadril (cm)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">PP</TableCell>
                    <TableCell>78-82</TableCell>
                    <TableCell>58-62</TableCell>
                    <TableCell>84-88</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">P</TableCell>
                    <TableCell>82-86</TableCell>
                    <TableCell>62-66</TableCell>
                    <TableCell>88-92</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">M</TableCell>
                    <TableCell>86-90</TableCell>
                    <TableCell>66-70</TableCell>
                    <TableCell>92-96</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">G</TableCell>
                    <TableCell>90-94</TableCell>
                    <TableCell>70-74</TableCell>
                    <TableCell>96-100</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">GG</TableCell>
                    <TableCell>94-98</TableCell>
                    <TableCell>74-78</TableCell>
                    <TableCell>100-104</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="bottoms">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Cintura (cm)</TableHead>
                    <TableHead>Quadril (cm)</TableHead>
                    <TableHead>Numeração</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">36</TableCell>
                    <TableCell>62-66</TableCell>
                    <TableCell>88-92</TableCell>
                    <TableCell>PP/P</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">38</TableCell>
                    <TableCell>66-70</TableCell>
                    <TableCell>92-96</TableCell>
                    <TableCell>P/M</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">40</TableCell>
                    <TableCell>70-74</TableCell>
                    <TableCell>96-100</TableCell>
                    <TableCell>M</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">42</TableCell>
                    <TableCell>74-78</TableCell>
                    <TableCell>100-104</TableCell>
                    <TableCell>G</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">44</TableCell>
                    <TableCell>78-82</TableCell>
                    <TableCell>104-108</TableCell>
                    <TableCell>GG</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="dresses">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Busto (cm)</TableHead>
                    <TableHead>Cintura (cm)</TableHead>
                    <TableHead>Quadril (cm)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">PP</TableCell>
                    <TableCell>78-82</TableCell>
                    <TableCell>58-62</TableCell>
                    <TableCell>84-88</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">P</TableCell>
                    <TableCell>82-86</TableCell>
                    <TableCell>62-66</TableCell>
                    <TableCell>88-92</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">M</TableCell>
                    <TableCell>86-90</TableCell>
                    <TableCell>66-70</TableCell>
                    <TableCell>92-96</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">G</TableCell>
                    <TableCell>90-94</TableCell>
                    <TableCell>70-74</TableCell>
                    <TableCell>96-100</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">GG</TableCell>
                    <TableCell>94-98</TableCell>
                    <TableCell>74-78</TableCell>
                    <TableCell>100-104</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>

          <div className="mt-8 p-6 bg-accent/10 rounded-lg">
            <h3 className="font-serif font-semibold mb-4">Como medir</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong>Busto:</strong> Meça na parte mais cheia do busto, mantendo a fita métrica reta</li>
              <li><strong>Cintura:</strong> Meça na parte mais fina da cintura, acima do umbigo</li>
              <li><strong>Quadril:</strong> Meça na parte mais larga do quadril</li>
            </ul>
          </div>
        </div>
      </main>
      
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default SizeGuide;
