// Category labels in historic product records are not always typed with the
// same apostrophe or dash characters as those used in the UI. Treat spelling
// variants as one category without altering user/seller database records.
export function categoryKey(value) {
  const normalized = String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("uz")
    .replace(/[‘’ʼʻˈ′`´]/g, "'")
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  // One customer-facing home category for both historical seller labels.
  // Do not modify or delete original database categories or products.
  if (["uy jihozlari", "uy-rozg'or", "uy ro'zg'or", "uy-rozgor", "uy rozgor"].includes(normalized)) {
    return "uy-ro'zg'or";
  }
  return normalized;
}

export function isCatalogProduct(product) {
  return product && product.is_active !== false && Number(product.price) > 0;
}

export function getCategoryCounts(products) {
  const counts = new Map();
  for (const product of products) {
    if (!isCatalogProduct(product)) continue;
    const key = categoryKey(product.category);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

// Only real, currently listed items are suggested; never synthesize fake stock.
export function getRelatedProducts(products, selectedCategory, limit = 6) {
  const category = categoryKey(selectedCategory);
  const related = products.filter(product =>
    isCatalogProduct(product) && categoryKey(product.category) !== category
  );
  const priorities = category === categoryKey("Uy-ro‘zg‘or")
    ? ["Maishiy kimyo", "Elektronika", "Boshqalar"]
    : [];
  const rank = product => {
    const index = priorities.findIndex(name => categoryKey(name) === categoryKey(product.category));
    return index < 0 ? 100 : index;
  };
  return related.sort((a, b) => rank(a) - rank(b) || Number(b.id) - Number(a.id)).slice(0, limit);
}
