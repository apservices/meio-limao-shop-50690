import { Helmet } from "react-helmet";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead = ({ 
  title = "Meio Limão - Moda Feminina Tropical Chic",
  description = "Descubra a elegância tropical da Meio Limão. Peças leves, sofisticadas e sustentáveis que celebram a brasilidade com estilo premium. Moda feminina que floresce vivendo.",
  keywords = "moda feminina, tropical chic, roupas femininas, moda brasileira, roupas leves, moda sustentável, vestidos femininos, blusas femininas, fashion brasil",
  image = "https://meiolimao.shop/og-image.jpg",
  url = "https://meiolimao.shop",
  type = "website"
}: SEOHeadProps) => {
  const siteTitle = title.includes("Meio Limão") ? title : `${title} | Meio Limão`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Meio Limão" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="Meio Limão" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Schema.org for Google */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ClothingStore",
          "name": "Meio Limão",
          "description": description,
          "url": url,
          "logo": "https://meiolimao.shop/logo.png",
          "image": image,
          "priceRange": "$$",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "BR"
          },
          "sameAs": [
            "https://instagram.com/meiolimao"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;
