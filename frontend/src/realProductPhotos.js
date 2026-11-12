// Product-specific real photography used only when a seller has not uploaded
// an exact item photo. These are temporary sample photos, NOT a claim that
// the seller's packaging/model is identical. Replace with seller-owned photos
// for production. Do not use unrelated category collages or generated artwork.
//
// Sources: two Unsplash License photographs and two third-party retailer images.
// Retailer images require rights-holder permission for continued commercial use.
export const REAL_PRODUCT_PHOTOS = [
  {
    pattern: /^choynak\s*1\s*l$/i,
    urls: [
      "https://img.zcdn.com.au/lf/50/hash/38404/20531925/4/White%2B1L%2BPorcelain%2BTeapot.jpg",
      "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&w=800&q=78",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Porcelain_Teapot.jpg/640px-Porcelain_Teapot.jpg"
    ]
  },
  {
    pattern: /^elektr\s*choynak(?:\s|$)/i,
    urls: [
      "https://ccapi.mitre10.co.nz/medias/sys_master/productimages/hd3/h36/10181113118750/Mitre10-1500x1500_2035493xlg/Mitre10-1500x1500-2035493xlg.jpg",
      "https://images.unsplash.com/photo-1607791776974-5c30b43ac181?auto=format&fit=crop&w=800&q=78"
    ]
  },
  {
    pattern: /^kitkat\s*41\s*g$/i,
    urls: [
      "https://cemacogt.vtexassets.com/arquivos/ids/369466/1010027_1.jpg?v=638422237870500000",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/KitKat.jpg/640px-KitKat.jpg"
    ]
  },
  {
    pattern: /^pantene\s*shampun\s*400\s*ml$/i,
    urls: [
      "https://static.ticimax.cloud/cdn-cgi/image/width%3D-%2Cquality%3D99/5011/uploads/urunresimleri/buyuk/2a7bc4a1-abe8-4307-8bfc-8b1ff94be5d5-4f2-98.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Shampoo_und_Pflegesp%C3%BClung_Pantene_V1.jpg/500px-Shampoo_und_Pflegesp%C3%BClung_Pantene_V1.jpg"
    ]
  }
];
export const getRealProductPhotos = (name) =>
  REAL_PRODUCT_PHOTOS.find(item => item.pattern.test(String(name || "").trim()))?.urls || [];
