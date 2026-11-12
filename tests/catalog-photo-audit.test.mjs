import assert from "node:assert/strict";
import test from "node:test";
import { summarizeCatalog } from "../scripts/audit-catalog-photos.mjs";

test("catalog image audit distinguishes uploaded from unverified sources", () => {
  const result = summarizeCatalog([
    { id: 1, name: "Milk", category: "Food", image_url: "/api/product-images/1", is_active:true },
    { id: 2, name: "Milk 2", category: "Food", image_url: "", is_active:true },
    { id: 3, name: "Tea", category: "Food", image_url: "https://example.org/tea.jpg", is_active:true },
    { id: 4, name: "Wrong", category: "Food", image_url: "/api/product-images/5", is_active:true },
    { id: 5, name: "Tea2", category: "Food", image_url: "https://example.org/tea.jpg", is_active:true },
    { id: 6, name: "Inactive", category: "Food", image_url: "", is_active:false },
    { id: 7, name: "Local", category: "Food", image_url: "/photos/seller.jpg", is_active:true },
    { id: 8, name: "Unsafe", category: "Food", image_url: "javascript:alert(1)", is_active:true }
  ]);
  assert.deepEqual(result.counts, {
    active:7, uploaded:1, missing:1, external_unverified:2,
    local_reference_unverified:1, wrong_product_id:1,
    invalid_reference:1, duplicate_reference_groups:1
  });
  assert.deepEqual(result.duplicatedImages[0].product_ids, ["3","5"]);
  assert.ok(!result.products.some(p=>p.id==="6"));
});
test("catalog image audit rejects invalid response data", () => {
  assert.throws(()=>summarizeCatalog({products:[]}),TypeError);
});
