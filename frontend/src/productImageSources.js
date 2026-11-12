// Curated third-party product photos for catalog items that currently have no seller image.
// Product names are matched conservatively, and seller-provided photos always win.
// These are image hotlinks, not uploaded/owned media; source sites may change or disallow reuse.
// Before commercial use, obtain permission or replace with seller-owned originals.
// Real photographs from Wikimedia Commons. These are *sample photos* of the
// product type / brand, not photos of the seller's actual physical stock.
// Commons Special:FilePath resolves to the hosted JPEG. Verify packaging with
// the seller, and replace these with original licensed seller images.
const commonsPhoto = filename => "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(filename);
export const SAMPLE_PRODUCT_PHOTOS = [
  {name:/^choynak\\s*1\\s*l$/i, photo:commonsPhoto("Teapot.jpeg"), source:"Wikimedia Commons", sample:true},
  {name:/^elektr\\s*choynak(?:\\s|$)/i, photo:commonsPhoto("Electric kettle.jpg"), source:"Wikimedia Commons", sample:true},
  {name:/^kitkat\\s*41\\s*g$/i, photo:commonsPhoto("KitKat.jpg"), source:"Wikimedia Commons", sample:true},
  {name:/^pantene\\s*shampun\\s*400\\s*ml$/i, photo:commonsPhoto("Shampoo und Pflegespülung Pantene V1.jpg"), source:"Wikimedia Commons", sample:true}
];
export const PRODUCT_PHOTO_MATCHES = [
  {name:/^fanta(?:\s|$)/i, photo:"https://yastatic.net/avatars/get-grocery-goods/2750890/635345e4-3f64-4a5f-aa55-20f41a9ce1cd/500x500-orig", source:"Yandex Lavka"},
  {name:/^fuse\s*tea(?:\s|$)/i, photo:"https://yastatic.net/avatars/get-grocery-goods/2888787/4e835155-82d8-481b-b8f7-04149e44508e/600x600?webp=true", source:"Yandex Lavka",note:"Example peach flavor; seller should verify actual flavor"},
  {name:/^sprite(?:\s|$)/i, photo:"https://yastatic.net/avatars/get-grocery-goods/2998515/82c53f0d-32b2-40cf-b1e0-0038da8281f8/500x500-orig", source:"Yandex Lavka"},
  {name:/^pepsi(?:\s|$)/i, photo:"https://olcha.uz/image/700x700/products/cdn_1/supplier/stores/1/2024-05-24/a4UBGxX1KqDaEsoNd9AjDUiOfdT6wtzY9sTDJCPJNM7bLlOgn4kJlnlSuZTH.jpg", source:"Olcha"},
  {name:/^coca[\s-]*cola(?:\s|$)/i, photo:"https://olcha.uz/image/original/products/2023-01-16/gazirovannyy-napitok-coca-cola-15-l-190706-0.jpg", source:"Olcha"},
  {name:/^lipton(?:\s|$)/i, photo:"https://olcha.uz/image/700x700/products/cdn_1/supplier/stores/1/2024-05-23/Gjp7LZrDKeYrr6MA19JLy34wVXCMVCxKxRoN9w8wYG7meYGY9rkazsNftDW5.png", source:"Olcha",note:"Green lemon tea variant"},
  {name:/^lenor(?:\s|$)/i, photo:"https://kontakt.az/media/catalog/product/cache/0a8af3db36f01f2d8dc4ea3efada0763/n/e/new_project_-_2023-04-07t133033.016.png", source:"Kontakt.az",note:"Spring Fresh variant"},
  {name:/^mr\.?\s*proper(?:\s|$)/i, photo:"https://mirtani.com/image/cache/catalog/produkti/4/preparat-za-pochistvane-mr-proper-universalen-1l-03085-a-256976941-1000x1000.jpg", source:"Mirtani"},
  {name:/^(?:soda|osh\s*sodasi)\s*500\s*(?:g|gr|gramm)(?:\s|$)/i, photo:"https://bozorcom.ams3.cdn.digitaloceanspaces.com/media/filer_public/d6/b3/d6b35004-451c-4463-878c-6661362bb4f0/cs_crimsoda_osh_sodasi_500_gr.jpg", source:"Bozor.com",note:"Crimsoda brand example"},
  {name:/^oyna\s*tozalagich\s*500\s*ml(?:\s|$)/i, photo:"https://mymarket.am/files/resizes/products/397/--luscan-econ_pr8526.700x700.jpg", source:"MyMarket.am",note:"Example 500ml glass cleaner packaging"},
  {name:/^kinder\s*bueno(?:\s|$)/i, photo:"https://irmag.ru/media/cache/catalog_element_popup/uploads/files/2022/12/21/8ef82568da2606dbfd5f7c51c51852cab3a24055.jpeg", source:"Irmag"},
];
export const PRODUCT_CATEGORY_PREVIEWS = {
  "Ichimliklar":"/categories/drinks.jpg",
  "Oziq-ovqat mahsulotlari":"/categories/food.jpg",
  "Shirinliklar":"/categories/sweets.jpg",
  "Maishiy kimyo":"/categories/cleaning.jpg",
  "Gigiyena vositalari":"/categories/hygiene.jpg",
  "Bolalar uchun":"/categories/bolalar.jpg",
  "Uy-ro‘zg‘or":"/categories/home.jpg",
  "Elektronika":"/categories/electronics.jpg"
};
export function matchedPhoto(product) {
  const name=String(product?.name || "").trim();
  return SAMPLE_PRODUCT_PHOTOS.find(item=>item.name.test(name)) || PRODUCT_PHOTO_MATCHES.find(item=>item.name.test(name)) || null;
}
export function categoryPreview(product) {
  return PRODUCT_CATEGORY_PREVIEWS[String(product?.category || "")] || null;
}
