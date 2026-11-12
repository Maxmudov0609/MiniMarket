// Read-only inventory photo audit. Never writes to the MiniMarket API or database.
// Run: node scripts/audit-catalog-photos.mjs [https://market-mj.uz/api/products]
// Outputs a machine-readable file and concise numbers; a reference is NOT a verified photo.
import { writeFile } from "node:fs/promises";

export function summarizeCatalog(products) {
  if (!Array.isArray(products)) throw new TypeError("Expected a product array");
  const active = products.filter(p => p && p.is_active !== false);
  const seen = new Map();
  const rows = active.map(p => {
    const image = typeof p.image_url === "string" ? p.image_url.trim() : "";
    const id = String(p.id ?? "");
    let type = "missing";
    if (image) {
      if (/^\/api\/product-images\/\d+$/.test(image)) {
        type = image === "/api/product-images/" + id ? "uploaded" : "wrong_product_id";
      } else if (/^https?:\/\//i.test(image)) {
        type = "external_unverified";
      } else if (/^\/(?!\/)[\w./-]+$/.test(image) && !image.includes("..")) {
        type = "local_reference_unverified";
      } else {
        type = "invalid_reference";
      }
      seen.set(image, [...(seen.get(image) || []), id]);
    }
    return {
      id, name: String(p.name || "").slice(0, 180),
      category: String(p.category || "").slice(0, 180),
      image_url: image || null, type
    };
  });
  const duplicatedImages = [...seen.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([image_url, product_ids]) => ({ image_url, product_ids }));
  const counts = {
    active: rows.length,
    uploaded: rows.filter(p => p.type === "uploaded").length,
    missing: rows.filter(p => p.type === "missing").length,
    external_unverified: rows.filter(p => p.type === "external_unverified").length,
    local_reference_unverified: rows.filter(p => p.type === "local_reference_unverified").length,
    wrong_product_id: rows.filter(p => p.type === "wrong_product_id").length,
    invalid_reference: rows.filter(p => p.type === "invalid_reference").length,
    duplicate_reference_groups: duplicatedImages.length
  };
  return {
    audited_at: new Date().toISOString(),
    disclaimer: "Image URL presence is not proof of image availability, correct packaging, authenticity, or commercial rights. Name-matched temporary samples are not counted as seller photos.",
    counts, duplicatedImages, products: rows
  };
}

async function readPublicCatalog(url) {
  // Long first timeout supports free-tier Render waking from sleep.
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(attempt === 0 ? 90000 : 30000),
        headers: { Accept: "application/json", "User-Agent": "MiniMarket-ReadOnlyCatalogPhotoAudit/1.0" }
      });
      if (!response.ok) throw new Error("Catalog API HTTP " + response.status);
      const body = await response.json();
      if (!Array.isArray(body)) throw new Error("Catalog API returned non-array JSON");
      return body;
    } catch (e) {
      lastError = e;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  throw lastError;
}

if (process.argv[1] && import.meta.url === new URL("file://" + process.argv[1]).href) {
  const url = process.argv[2] || "https://market-mj.uz/api/products";
  if (!url.startsWith("https://")) throw new Error("Only HTTPS public catalog URL is allowed");
  try {
    const report = summarizeCatalog(await readPublicCatalog(url));
    await writeFile("catalog-photo-audit.json", JSON.stringify(report, null, 2) + "\n", "utf8");
    console.log("MiniMarket read-only catalog photo audit:\n" + JSON.stringify(report.counts, null, 2));
    console.log("Photo report: catalog-photo-audit.json");
  } catch (error) {
    console.error("Live catalog could not be audited:", error.message);
    process.exitCode = 1;
  }
}
