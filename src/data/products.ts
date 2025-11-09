import productDressYellow from "@/assets/product-dress-yellow.jpg";
import productBlouseGreen from "@/assets/product-blouse-green.jpg";
import productPantsWhite from "@/assets/product-pants-white.jpg";
import productTopPastel from "@/assets/product-top-pastel.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  sizes: string[];
  colors: string[];
  isNew?: boolean;
  rating: number;
  reviews: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Vestido Longo Solar",
    price: 289.90,
    originalPrice: 389.90,
    image: productDressYellow,
    category: "Vestidos",
    description: "Vestido longo em tecido fluído com alças ajustáveis. Perfeito para dias quentes e ensolarados.",
    sizes: ["PP", "P", "M", "G", "GG"],
    colors: ["Amarelo Limão", "Verde Menta"],
    isNew: true,
    rating: 5,
    reviews: 28,
  },
  {
    id: "2",
    name: "Camisa Tropical Paradise",
    price: 179.90,
    image: productBlouseGreen,
    category: "Blusas",
    description: "Camisa oversized com estampa de folhagens tropicais. Mangas 3/4 e tecido leve.",
    sizes: ["PP", "P", "M", "G"],
    colors: ["Verde Tropical", "Azul Céu"],
    isNew: true,
    rating: 4.5,
    reviews: 15,
  },
  {
    id: "3",
    name: "Calça Linho Natural",
    price: 229.90,
    image: productPantsWhite,
    category: "Calças",
    description: "Calça de linho com cós elástico e bolsos laterais. Leve e confortável.",
    sizes: ["36", "38", "40", "42", "44"],
    colors: ["Off White", "Bege Natural"],
    rating: 4.8,
    reviews: 42,
  },
  {
    id: "4",
    name: "Top Ciganinha Babados",
    price: 129.90,
    originalPrice: 179.90,
    image: productTopPastel,
    category: "Tops",
    description: "Top cropped estilo ciganinha com babados delicados. Perfeito para combinar com calças ou saias.",
    sizes: ["PP", "P", "M", "G"],
    colors: ["Amarelo Pastel", "Rosa Claro", "Verde Água"],
    rating: 4.7,
    reviews: 33,
  },
  {
    id: "5",
    name: "Vestido Midi Amarração",
    price: 249.90,
    image: productDressYellow,
    category: "Vestidos",
    description: "Vestido midi com amarração na cintura e decote em V. Tecido levinho e feminino.",
    sizes: ["PP", "P", "M", "G", "GG"],
    colors: ["Limão", "Coral", "Menta"],
    isNew: true,
    rating: 5,
    reviews: 19,
  },
  {
    id: "6",
    name: "Conjunto Linho Verão",
    price: 359.90,
    image: productPantsWhite,
    category: "Conjuntos",
    description: "Conjunto de linho com top cropped e calça pantalona. Elegante e confortável.",
    sizes: ["PP", "P", "M", "G"],
    colors: ["Off White", "Areia"],
    rating: 4.9,
    reviews: 51,
  },
];
