import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./AppNext.css";
import "./MarketEditorial.css";
import "./MarketSearch.css";
import "./MarketplaceRefinements.css";
import "./MarketV3.css";
import { matchedPhoto } from "./productImageSources";
import ProductIllustration from "./ProductIllustration.jsx";
import { categoryKey, getCategoryCounts, getRelatedProducts, isCatalogProduct, photoReferenceStatus } from "./catalogCategories";

const GOOGLE_CLIENT_ID = "957838455109-tsmj5fstgcncsjj19qo29sfkoe9i3kfa.apps.googleusercontent.com";
const CATEGORIES = [
  ["Ichimliklar", "🥤"], ["Oziq-ovqat mahsulotlari", "🥐"],
  ["Shirinliklar", "🍫"], ["Maishiy kimyo", "🫧"],
  ["Gigiyena vositalari", "🧴"], ["Bolalar uchun", "🧸"],
  ["Uy-ro‘zg‘or", "🏡"], ["Elektronika", "🎧"],
  ["Kiyim-kechak", "👟"], ["Sport", "⚽"], ["Boshqalar", "🛍️"]
];
const WORDS = {
  uz: {
    shop: "Do‘kon", categories: "Kategoriyalar", delivery: "Qulay xaridlar",
    search: "Nima qidiryapsiz?", signin: "Kirish", signup: "Ro‘yxatdan o‘tish",
    catalog: "Barcha mahsulotlar", subtitle: "Siz qidirgan mahsulotlar — bir joyda",
    heroTitle: "Har kuni kerakli narsalar, bir joyda.",
    heroText: "Haqiqiy sotuvchilarning mahsulotlarini kashf eting. Qidiring, tanlang va qulay buyurtma bering.",
    explore: "Xaridni boshlash", browse: "Mahsulotlarni ko‘rish",
    newItems: "Yangi mahsulotlar", realPrices: "Haqiqiy narxlar",
    categoriesTitle: "Nimani izlayapsiz?", all: "Barchasi",
    ourProducts: "Siz uchun mahsulotlar", productsText: "O‘zingizga keraklisini toping",
    found: "ta mahsulot", newest: "Eng yangi", low: "Arzonidan", high: "Qimmatidan",
    sort: "Saralash", min: "Min. narx", max: "Maks. narx", clear: "Tozalash",
    add: "Savatchaga", available: "Mavjud", unavailable: "Tugagan",
    buy: "Buyurtma berish", cart: "Savatcha", emptyCart: "Savatchangiz bo‘sh",
    favorites: "Sevimlilar", account: "Kabinet", seller: "Sotuvchi kabineti",
    logout: "Chiqish", total: "Jami", qty: "Miqdor", close: "Yopish",
    loading: "Mahsulotlar yuklanmoqda...", retry: "Qayta urinish",
    showMore: "Yana ko‘rsatish", noResults: "Hech narsa topilmadi",
    noResultsText: "Qidiruvni yoki filtrlarni o‘zgartirib ko‘ring.",
    order: "Buyurtmani tasdiqlash", yourName: "Ismingiz", phone: "Telefon raqamingiz",
    address: "Yetkazish manzili", note: "Qo‘shimcha izoh (ixtiyoriy)",
    payment: "To‘lov yetkazib berilganda amalga oshiriladi.",
    loginFirst: "Buyurtma uchun xaridor akkauntiga kiring.",
    successOrder: "Buyurtmangiz qabul qilindi! Raqami: #",
    about: "MiniMarket — xarid qilishning sodda yo‘li",
    foot: "Mahsulotlar va narxlar sotuvchilar tomonidan kiritiladi.",
    back: "Ortga", yourOrders: "Buyurtmalarim", myProducts: "Mahsulotlarim",
    orders: "Kelgan buyurtmalar", newProduct: "Mahsulot qo‘shish",
    save: "Saqlash", edit: "Tahrirlash", delete: "O‘chirish",
    name: "Mahsulot nomi", description: "Tavsif", price: "Narxi",
    category: "Kategoriya", stock: "Ombordagi soni", image: "Rasm havolasi",
    email: "Email", password: "Parol", loginTitle: "Xush kelibsiz",
    createAccount: "Yangi hisob ochish", buyer: "Xaridor", sellerRole: "Sotuvchi",
    changeLang: "Tilni o‘zgartirish", filter: "Filtrlar",
    updated: "Ro‘yxat yangilanmoqda", offline: "Server bilan aloqa yo‘q. Saqlangan mahsulotlar ko‘rsatilmoqda.",
    sellerOnly: "Sotuvchi yoki administrator hisobi kerak.",
    notice: "Buyurtmadan oldin narx va mahsulot miqdori serverda qayta tekshiriladi."
  },
  ru: {
    shop: "Магазин", categories: "Категории", delivery: "Удобные покупки",
    search: "Что вы ищете?", signin: "Войти", signup: "Регистрация",
    catalog: "Все товары", subtitle: "Всё нужное в одном месте",
    heroTitle: "Всё нужное каждый день. В одном месте.",
    heroText: "Открывайте товары реальных продавцов. Выбирайте и оформляйте заказ.",
    explore: "Начать покупки", browse: "Посмотреть товары",
    newItems: "Новые товары", realPrices: "Актуальные цены",
    categoriesTitle: "Что вы ищете?", all: "Все",
    ourProducts: "Товары для вас", productsText: "Найдите то, что вам нужно",
    found: "товаров", newest: "Сначала новые", low: "Сначала дешёвые", high: "Сначала дорогие",
    sort: "Сортировка", min: "Мин. цена", max: "Макс. цена", clear: "Сброс",
    add: "В корзину", available: "В наличии", unavailable: "Нет в наличии",
    buy: "Оформить заказ", cart: "Корзина", emptyCart: "Корзина пуста",
    favorites: "Избранное", account: "Кабинет", seller: "Кабинет продавца",
    logout: "Выйти", total: "Итого", qty: "Количество", close: "Закрыть",
    loading: "Загрузка товаров...", retry: "Повторить",
    showMore: "Показать ещё", noResults: "Ничего не найдено",
    noResultsText: "Попробуйте изменить поиск или фильтры.",
    order: "Подтвердить заказ", yourName: "Ваше имя", phone: "Номер телефона",
    address: "Адрес доставки", note: "Комментарий (необязательно)",
    payment: "Оплата при получении заказа.",
    loginFirst: "Для заказа войдите в аккаунт покупателя.",
    successOrder: "Заказ принят! Номер: #",
    about: "MiniMarket — покупки без сложностей",
    foot: "Товары и цены добавляют продавцы.",
    back: "Назад", yourOrders: "Мои заказы", myProducts: "Мои товары",
    orders: "Заказы", newProduct: "Добавить товар", save: "Сохранить",
    edit: "Изменить", delete: "Удалить", name: "Название товара",
    description: "Описание", price: "Цена", category: "Категория",
    stock: "Остаток", image: "Ссылка на фото", email: "Email",
    password: "Пароль", loginTitle: "Добро пожаловать",
    createAccount: "Создать аккаунт", buyer: "Покупатель", sellerRole: "Продавец",
    changeLang: "Язык", filter: "Фильтры", updated: "Обновляем список",
    offline: "Нет связи с сервером. Показаны сохранённые товары.",
    sellerOnly: "Нужен аккаунт продавца или администратора.",
    notice: "Перед заказом цены и остатки проверяются сервером."
  },
  en: {
    shop: "Store", categories: "Categories", delivery: "Easy shopping",
    search: "What are you looking for?", signin: "Sign in", signup: "Sign up",
    catalog: "All products", subtitle: "Everything you need, in one place",
    heroTitle: "Everyday essentials. All in one place.",
    heroText: "Discover products from real sellers. Find what you love and place an order.",
    explore: "Start shopping", browse: "Browse products",
    newItems: "New arrivals", realPrices: "Real prices",
    categoriesTitle: "What are you looking for?", all: "All",
    ourProducts: "Picked for you", productsText: "Find what you need",
    found: "products", newest: "Newest first", low: "Price: low to high", high: "Price: high to low",
    sort: "Sort", min: "Min price", max: "Max price", clear: "Reset",
    add: "Add to cart", available: "In stock", unavailable: "Out of stock",
    buy: "Checkout", cart: "Cart", emptyCart: "Your cart is empty",
    favorites: "Favorites", account: "Account", seller: "Seller dashboard",
    logout: "Sign out", total: "Total", qty: "Quantity", close: "Close",
    loading: "Loading products...", retry: "Retry",
    showMore: "Show more", noResults: "No products found",
    noResultsText: "Try changing your search or filters.",
    order: "Place order", yourName: "Your name", phone: "Phone number",
    address: "Delivery address", note: "Order note (optional)",
    payment: "Pay when your order is delivered.",
    loginFirst: "Please sign in as a buyer to order.",
    successOrder: "Order placed! Number: #",
    about: "MiniMarket — shopping made simple",
    foot: "Products and prices are provided by sellers.",
    back: "Back", yourOrders: "My orders", myProducts: "My products",
    orders: "Incoming orders", newProduct: "Add product", save: "Save",
    edit: "Edit", delete: "Delete", name: "Product name",
    description: "Description", price: "Price", category: "Category",
    stock: "In stock", image: "Image URL", email: "Email",
    password: "Password", loginTitle: "Welcome back", createAccount: "Create account",
    buyer: "Buyer", sellerRole: "Seller", changeLang: "Language",
    filter: "Filters", updated: "Refreshing list",
    offline: "Server unavailable. Showing cached products.",
    sellerOnly: "A seller or admin account is required.",
    notice: "Prices and stock are verified by the server before the order is placed."
  }
};
const WORD = (lang, key) => WORDS[lang]?.[key] || WORDS.uz[key] || key;
const money = value => new Intl.NumberFormat("uz-UZ").format(Math.round(Number(value) || 0)) + " so‘m";
// Order estimates are displayed in Uzbekistan (Asia/Tashkent, UTC+05:00) time.
const deliveryDate = (iso, language = "uz") => {
  if (!iso || Number.isNaN(Date.parse(iso))) return null;
  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : language === "en" ? "en-GB" : "uz-UZ", {
    timeZone:"Asia/Tashkent", day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"
  }).format(new Date(iso));
};
const tashkentDateInput = iso => iso && !Number.isNaN(Date.parse(iso))
  ? new Date(Date.parse(iso)+5*3600000).toISOString().slice(0,16) : "";
const uploadProductPhoto = async (productId, file, token) => {
  const types = ["image/jpeg","image/png","image/webp"];
  if (!types.includes(file.type) || file.size > 1500000 || file.size < 24) {
    throw new Error("JPEG, PNG yoki WebP rasm tanlang (1.5 MB gacha)");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch("/api/seller/products/"+encodeURIComponent(productId)+"/image", {
      method:"PUT",headers:{"Content-Type":file.type,Authorization:"Bearer "+token},
      body:file,signal:controller.signal
    });
    const result=await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(result.error || "Rasmni yuklab bo‘lmadi");
    return result;
  } catch(error) {
    if (error.name === "AbortError") throw new Error("Rasm yuklash vaqti tugadi. Qayta urinib ko‘ring.");
    throw error;
  } finally { clearTimeout(timeout); }
};
function readJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function persist(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private browsing */ }
}
async function api(path, { method = "GET", data, token, signal, timeoutMs = 25000 } = {}) {
  const controller = new AbortController();
  let abortHandler;
  if (signal) {
    if (signal.aborted) controller.abort();
    else {
      abortHandler = () => controller.abort();
      signal.addEventListener("abort", abortHandler, { once: true });
    }
  }
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch("/api" + path, {
      method,
      headers: { ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: "Bearer " + token } : {}) },
      body: data === undefined ? undefined : JSON.stringify(data),
      signal: controller.signal
    });
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : { error: "Serverdan kutilmagan javob keldi" };
    if (!response.ok) {
      const error = new Error(body.error || "HTTP " + response.status);
      error.status = response.status;
      throw error;
    }
    return body;
  } catch (error) {
    if (error.name === "AbortError" && !signal?.aborted) {
      throw new Error("Server bilan bog‘lanish uzoq davom etdi. Qayta urinib ko‘ring.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    if (signal && abortHandler) signal.removeEventListener("abort", abortHandler);
  }
}
const CATEGORY_PICTURES = {
  "Ichimliklar": "🥤", "Oziq-ovqat mahsulotlari": "🥯", "Shirinliklar": "🍬",
  "Maishiy kimyo": "🫧", "Gigiyena vositalari": "🧴", "Bolalar uchun": "🧸",
  "Uy-ro‘zg‘or": "🏡", "Elektronika": "🎧", "Kiyim-kechak": "👟",
  "Uy jihozlari": "🛋️", "Sport": "⚽", "Boshqalar": "🛍️"
};
// Show bundled images only for verified, matching products. Never point to missing assets.
// Real photographs only. Seller-supplied images always take priority.
// Wikimedia photographs are product-type examples, not guaranteed exact packages.
// Sellers should upload their own precise product photos. Artwork is not reused.
const BUNDLED_PRODUCT_IMAGES = [
  [/^choynak\s*1\s*l$/i, "https://commons.wikimedia.org/wiki/Special:Redirect/file/Porcelain_Teapot.jpg?width=640"],
  [/^elektr\s*choynak(?:\s|$)/i, "https://commons.wikimedia.org/wiki/Special:Redirect/file/Electric-kettle.jpg?width=640"],
  [/^kitkat\s*41\s*g$/i, "https://commons.wikimedia.org/wiki/Special:Redirect/file/KitKat.jpg?width=640"],
  [/^pantene\s*shampun\s*400\s*ml$/i, "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shampoo_und_Pflegesp%C3%BClung_Pantene_V1.jpg?width=640"],
  [/^nivea(?:\s|$)/i, "/nivea.webp"],
  [/^fairy(?:\s|$)/i, "/fairy.jpg"],
  [/^grechka(?:\s|$)/i, "/grechka.jpg"],
  [/^persil(?:\s|$)/i, "/persil.jpg"],
  [/^hydrolife(?:\s|$)/i, "/hydrolife.png"],
  [/^plastilin(?:\s|$)/i, "/plastilin.png"],
  [/^dezodorant(?:\s|$)/i, "/dezodorant.jpg"],
  [/^sovun(?:\s|$)/i, "/sovun.jpg"],
  [/^hdmi(?:\s|$)/i, "/hdmi.jpg"],
  [/^bluetooth(?:\s|$)|^karnay(?:\s|$)/i, "/images/bluetooth-karnay.jpg"],
  [/^choco.?pie(?:\s|$)/i, "/chocopie.jpg"],
  [/^koptok(?:\s|$)/i, "/koptok.jpg"]
];
// Local, brand-labelled sample renders for selected catalog products. These are not
// verified packaging photographs; real seller uploads always take precedence.
// Generated sample product photography, clearly labelled. Replace with the seller's own photo once available.
const GENERATED_PRODUCT_PREVIEWS = [
  [/^ariel\s*1[.,]?5\s*kg$/i, "data:image/webp;base64,UklGRrYHAABXRUJQVlA4IKoHAABwIgCdASpwAHAAPulkq02pJaQiL7lbgSAdCWwAzMjMUj+WfCSRhfr+EPq+jfby88npwHoAdMH/gqBT0Qh23EdVXgPMLYgaarQA4vn1GYPC13VrMQ5VtBoKJ5CLd3Ux0sRE4Z2zIH6qCMvjI70CT/GcYwl4JqPIWmLTxE20gwtsemIdO2zSZrfFwi9Sn9P/zAXyl2tDzigEbb3RKsBWzru97aogCLdTIr586tEbhb/BliD7uicvsOn7stiuHusVl2edfK6BNhHbMQVlv+1+aaVUR+jErmyFJGYZLsfTGZDr5zCcJ7pZvcxHu16U0/x1wR2mAP//tNGl9Cj9JFnh7d/7+Wp2Vq85HsvwEvtBMetR4FUak/Sj9LeZ9v9OAAD++oFF4VZiLNaWFZ+MoogYjdXOp7bCTxGb10i5jZFgrRmr3EDpNU+2yqsTPXO+M1Z78lDrxA7rGAmQDeXLcYaXUy3qdb0C4rR3LguyCHKM6i/2e9lcN/9EgfejXB4+Li6jv2JQqqRfj7G5wLcyMfj36rsN6p8dP7O0R3IvFHU682C9gK1+G8j7Q/gHpYOss7Y6znGZKSGNNqfZaw9SQ3zj5UeUFUia3F2tPHiCHxg8m2CsN6JhphW1yeO/ZxGWAg/p8cZeRiGU8MGrcbmrqDskA7qV/Vp/2rdox9jMQvD6z5U64QfBMCMmmq5ypSksL7yrwQ4Lt+V0GPS6EaWl/BP9wZivLAY8qiGX2SyEiet1q4kcrwpObU2F6JfOjAzq3v9yCMpv30BU0Neua3PdPZEyBfy63+S7kLarH4Id4NV0RydDv+E3GWXqxld+VGI7keIuf5zSr4553P58MeWMs8alUpizb06hAfmqQlSw95SngHE8j2XvZzWZv2KbJkprzaE6ir/+7/Roc22l0A+gcSSXU6ePhlNrs8rxPO9j+cNV+EqDu8diAcE1ILxF/zVeuQ8AF3QuiVHfIL+pyjeRVBVVcZ/hCCorIr70S+SfjGNqFUrcPThNu5fjkOid7ZvpWH2qh/9g1VTTUdSq59s+zVVVOfDbw04OPqmcRUo9LAtTmcsjY6HqDmvHIBXQbwQWVQyjhiAs/zt+h76C5v3SuseliYHEhSrjtZ9oM3mF/31iHM9/VHZYxN1X+uqASNSnT8CsA4XtUHdeAYt8XHpbCBXRjOOedEcNGO88RWW4ZA0ci4Fbjul7UXnNJU7apnFkrkv3zO9szNqao5tJYMA0+CQndnw8gBeLK6vqRLlQXKkek1aSX9sfnlcBD+3/+UaohhN/MsCBPM1ydvRtD2+9/FJZKJ/e6004UhTqwPZw1e9OnFHIjT7Iub4zg6sZeKYvyv2C5/97w1n9Iy7g7BDS6q5TYJtJRvWg5c97YWSnXSClhEc7LwsRBFd2lQCaTxBfs5tC8CNwEMPpeCEDrMOv58u9Qln+c/xNJF6eo59qfiQCIT63naHLju53JPYE7QBlQTfYc3uTt4JogTyNvHgN8qlDCGCB0eFqvaGpy8ZLwRZlssFp9K5JHfYVN7Po0W34WzV9XWy3KEv9KDH3Mzi3XSY2qLm4ROccGjce6txMEvgQ6C8i+Lwkx1UZI6iJ0yYBUwSKmVNPQcOeaVNF4y7oysmxfIOiqFMjsQpDeUZTVm2ezhSPgoNpjNOLOJxn71+4tiDLBp4z2KtvLu+p1A67wULe0KxQTtIT2fNT79Q2m7blSScxIknJBFY69Qj+mcyHRcyf6VtfDPctZV8WujdqrWwANEif+De/nMb8WPrh8P7u26c0plpzvL0We87OjDtPD5NhYOKRlxGhzzbS9DNiEX7T/lcQcE2H33DbJ6vHvZskpvNG0ucNjVogXk1sLcN4XKXQln2gwgYi6TIIP+75QZoJn2Kn2V8SyIGyqIGw4/7o+GTc6j+49eimGCFoLEorjlyEY/VnP4zFKdpYlqTirEkZtj9oDpYEhn6vwQ/Vu9TlSt0496dkHTE+XEhdW18WNsP91z9N3FJC1A/GxHbo5R4rfKLP+PC1vj8oGsTDz7eFP11S9kmMHjMSNSGxYnhRtuDOSUHZEPnoTpzvcVdDojrQbu4VYMQY8k+eG8z8nzMAu91vU1mv7UE8vyElunYFVFLLajQeS5J9eQlkh+tmOUrMn6KOJ87hjcpn98XpP6BPG6K/1+Afk73OGmiJHbFq75fzNiDH+/8bIFBD2Ft6lL+1G+rYWTFF1XW5Kafok6gAaT456L8BGivU9tCCeMk4SkfpONQY08A1DEhAz5KdIgEiEo8tpkh9ZG+vFvfkq6f2lvugRLEfj6vpmHoel9iwsGrj5KvOTwj8692t3wSuyFxqQAXMx8IW8A8rERybLnnUtF6ek+5G5REuvO7n/M5+hm343h5Seegxk9uDmtvSAcrIFf8eB/994Coe6ZKysNXW4y2kU39vLZ1xiR7JwgicXXflhkxawqMhoqHu98PC5jv8+YoGcSaltfY2Ck571yGZYGePbYM1npNYWeFa/qajlBkIseLr/9KdA0caTd8Ygqy2q2Gn6iBWHSJxnOYixpKfKQx3sf2Ot67gCQFp7o5Ixa2VDYSIXWAVXpZThZJjvy/x0w5UfJczVEoNfgmhNch2Q1HB/q0yCCwfrxXgAAA="],
  [/^vanish\s*450\s*ml$/i, "data:image/webp;base64,UklGRiYFAABXRUJQVlA4IBoFAACQGgCdASpwAHAAPu1qq1AppiOiq9nKUTAdiWgA0XRbLzwGxj4Ze268wH66erh6EP8Bvl/oAdML/lrU6anehGYNs+b6ssfYedj0qeMn5W5C11J05pSR8o2cpBiBJ9xi743bgchkuOcW6+iyu7VhMu0vNYqK7mW08MkRXR8PcLYSN6aA3WuUxQ7mweYJC+fKPgNRJ2NqietnbgQ8dLXnIWqmCPMrZgnnfz//pAS+rm36NyVoemLh6d9oDdgUN/4KSu/Ao2iO3P1D7Wk57G9R/1/yJwNvJgFwYGeepcQQ0AD+9Q2uDPevC5nJVCzGnnoMosnWsORfN4h6X9zAo96u53Cz6jPaG/1xIDgfh1mOQYy7zPEjy/j8RPu/DdOmKQwyWG/PDjWPJ+DDVWwxP+rLkH0X8je+eEY/I869BpKUGGdXLxFHqpgAZjbKC+vGTAgL9XYYBtv3AR6MZ20h3Qj4+dM5GXkrTyDMRyAhzw6Ibr/uUnaOiHVdYwiSR5Yc7dEujNSJuIGvEEKn+GplOMbj3DQU2trhvhawrRxD1rtHDGpE7DzPwBXffOfSbUMZTCrVUE1v/FuLTOZhkXUPwyE5jNHUdEFU+6aO7qPNlHJTDmZF2D9aKJ188fl9Benzv/WdPUymmWwgdMn4sTdxPe5jp5oj1YyxbzS0EKCSt3M+8oaH4/BZZAl3aKamqfeXlwS1degMzwCOPWkC8V2kLHWZY2Qt3BQssHxEfZ92Xa88WpkO/VARrKoJL3VIg62NgDR8+1y95LT+ZpNLIql3UFLgUJmK3ehqWy7S9+bWwl+bEtyrtNq0d9H7hFX5pjqU5uL9Hi+lrGlxG7Ro1vX0xKQ58h7bnYOfMEHm/EJEwhHu2//MlZfGIWPr8whiK4dMKTb2cfC8FDSt0IewFJfJkyfyY2eCFcJflSKoilKdO/cWtz/NYwyGSkuyYgMrNABReSszIFcXegOAbdWLPYURTxox7t6gnzMiSPXgb+KOxmz69KPQEFYV/5uWC2VrR/kvXVm+Qrz/6GKt8RzA5zs89Zetp3DXDPd22xHy6+zHJBfbBeimwvuhMiCRllJK6Mvw6OhcDi3+6Ti+XdSaHP8wnY/5aPYlUmqGYk62BruFYchwTa3+O0iS2JX1W/fhWEnKFQzmtPYtWa+je8Q1EeyoaruHpSR3LS7wy7aVNvfFsU/GzOZ0pV5V7ct01dKdCI2DgRCQ4UgvpxN3qEst25VyZPx4bZL2mB2Gyob78cwHudxXpEf0NLA+hZXnaToPOa4P/EylKk/Omg5otMfywLv5dvc3q1KJC3LzsRCAx2WfEPX28flcYkiTCXpZ5S7eQzqExKIkKNK6TzM++b6WR8X5koOPGu84HJl0q3Hc9G1A2rrJqg8H1rh4qOfJe/XcZ0PziyN1zMD4rvJzWg4vmnAHvVahmmzeo6YKwxc8UtEvq0KmtSP9ubNQO0HXoEOUT9Dak27OTDuSQrUgzr+oLnFfdqoRw1VV2t6U9tCFiSYeu/NXVRo2Qz5vhwmOEKvyx9+Z7y/Psb//+l4Gu1YUWYQpIBfAidz8qO4uLWcf3L1MnQiCg85TIEtpbBwuV0lDl3+l97ud+hV7IWfl+LTCSjDXhbcRs9at1OYbAsWGIR4wnbSIEgJ8CxUUvGvQwhwRv/iZ6Wqnk9PBzya0EWVU4dvsDzfLHjSNvRb52B/IKMmtYnK8YtG001lNki5X4WQTAtRYkEonzsx3FxjVVl0lAAAA"],
  [/^domestos\s*750\s*ml$/i, "data:image/webp;base64,UklGRjYEAABXRUJQVlA4ICoEAADwFQCdASpwAHAAPu1utFIppiWiqTSZYTAdiWQA1awjzclueUA9b/mA/Wn1uPRl/qt833l6fg8+4X9Xc8kdHrM5qHlh4TYy/hTizXTYjV+hj4f0ZWr93ikSTSCGDp1DNGOd8dABBoejQLXcBt62+KahYtrgO83jBZy7vWN/2vf2vXD4u6oZwmt4zqOsybbEuMXZpSfH4f29TV2Sh75ZlI/3XQAjYnoXCQ0Mnxmie5XzDEnEpXVJPK2AAP73kGDXuKTk/CmD+GkAlgl4AidIbqWvHIPkoJpvcUEMGQgH6p2czYHbtBUpOtLx3vGKYwS8W1TuHBWrof/ARjKkzQNPxxYPWD7QNFzPBvpR/dLhE+GhmEv8fO+Iik42GUTN/a94iV26pnqTUypwkSz7/Atuu2TO//o1BHuQgfX0M7Nea7V+g9wB9SRAZ2ERcuHQvQbjxY8J3wvNkqsjACiSdsGAOOIy7q+CtL1x/388IPyvmrFm6ejtF+Kbf4OWx6Pd4sk4FnhqJpbY6ZdEl6OY9n5PFsv3Fu1IRJiX4e0heyITCmerjpKylt3ehccKd0vllvOp4IM+YcwRh0CvVEQVsDu/+dz1JCphUx6WzbyTHvwXa6UBBmlPNsVwb8/E8DSsHXENCaEHrx+qdfjH/eSHMu32JMKzVnhVqJ6ZNaKorOgbddZQ4jg6lPpP7xbFSb1uHqqNooZgoLdJ2wShiStB8ddltEKsWBFELzEqGRNT3NWCnrkoiT4P8Ky6yaS1W/Ye5BaDVIT7Nn/aWbBRqMR/MrIGzDhG/QaI2lI6+CeclA+P1mMJGgoQ1epp15ZJ5l9yrpovJtcFVlGsfZ2HQDcZwbnYPtmzIq3GhW6+0ISMRwdMSUJY2uZYLVK1WqPfqc7cJuFgO9tx9z4afPkD5J+o8YVYO+jBYeY0zhIaQ+BVE9ejjaR0/I3Yv3r493kySAilPBsghifLdt+cjGOvvqZCgMAawbgWkufRLdRHvv+atxVBaKnwKzLUe8VSPe0TSjc3wklbH/EoTY4mhWhpkFmMegjZ+464KQ44GsOqaMoZhTs9WUEItLji9HHDZ5iEnE3W7BLMEkr3jqelFiva2Uq+Yg/NSdq+GuHj97SV2OQrwZWe4hpGdOB6N4FE8tzz0zA8RPom2TMHb6aPk1CNmHZFKwk1puZQhOBfNW6ad1IQz4Vvrz+78IHTMAPt7SmdQxejj+rU8J/8BNTsI4G+dkczgiCHf/6CVE0Nd7ONd4RpBh/CdepSgLoUcyQNQVnhl9bqbblwYnAyJGbI5SLbWl+ITmm9YIi6I7ayRHgjSq7JaKZF1BHTd2Mxuo9Yr22NPgLH42evKnKHeVlMqo5QgW7gleZUfZoXJWwt7+yrgXkOUEHIkJRP5qqx1snctseXz8p1Gu/V3JcRMyHC5jaQ+gAA"],
  [/^cif\s*krem\s*500\s*ml$/i, "data:image/webp;base64,UklGRroDAABXRUJQVlA4IK4DAADQFACdASpwAHAAPu1wslKppiSipVgKiTAdiUAapo05zC7+3a58PTQIE69sNILlo5haO388WT8BMm0Y+iuJwGHPcEnnroZj1t4Lqqd0eXtQ+TDyQ5/6LB+CXKB0LNhk8kdPxHUsehzoByemJ7m2h6RM4N48XaFprsDccChTEjnoWWoye4n+xwxF69O3iSpmg02VHsNH7wAQv4Ae7b2mARy4yWwZ5VBZGeOV3x+c7KngAP73IIUiBydbkm7B6AXnZ+U0p1FyWOrnPdoz/X3wnX8vVjQm6OvkuZJMtuuEQ+mIwgcU3BegEluvojdzxdw6bwqSqdRSyrnPn5aZQLCDgTCbrVGB8ACUjjsvkk7a30ZwPoCyeh8Wf0CEc9j0QTii5BXXOJG4SrMIqFtuCzvma0JOxVgDd0G8Eq4yundDT7WCszUMsxLfpMqeclzPAoXUUkBOAwpM4q2/AAc+I38j4J3Lj1Vinx9P2VoRE7AzBojhG4CZFLNA3qp0+Yeo1FbA7Fv5r0NIVCAIsNtSajY7xZz/EzQ0rn38idDmmEMljkpc17+2XeFWPsfTnkIXwaD3c8BnErYqHlf9LHX4w2tUkcxUc6aDh/UJVxbyQrd7V9+hZ4yJAQakNn+oF+BozCzd287Pv6jDixLwJp0cSdWBdyPeolE2jgcw9hAYaqSgDx2/Ud/VuWiq2P4qnvptDDNkp4mer2S9cfK/QG4rRh/VrSzCma/Ojj3BbrThKeEMC9i95lpudT2WCyXmCGgEhxbc+mRCLMkbtExvowqG3FVPxspk7dF4g62UUnw3lpAoekri/YQ/FTDGryyE6V0usmhZCiciTSTIPx2+YNfvkkhLiwRjxd5Yx3MqPJSlvFXSdk+Lfv2mw0frEmt0MAhFt1LRW9oKv4qcfCIIyoTRR0uPB8jTe8Xrt8LAlIUUQqNbfyQ0bUnabfnb809HyNSNuaNhjq+3ykDGU5OLFyoL7/J2wzTS+wFQjjjVNtKzy01C1q7HAlGs+YWKpZEL1GBJGHSWlUE0REc0GM4vEtLxmvHE3hqjf3bDRLBQO4i5gI6t/ndwvexfx42KfZJUJMQssb5VvZNzmjzGzoQWBOsAkX/NArAV1vLqWe/DY22lglfh9ryVUfE5pY0bhSo0/6bQwTVhUzzOyfhL6MsndarvWPI2FAxAgLT2QFjD89Ncv7dabixgLGhT0Rjv9B/njt/T9hCykjY5y6qVsnSVrb1RztjD1hAQEJTDhDW3tjXa4AAAAA="],
  [/^xiaomi\s*power\s*bank\s*10000\s*m(?:a|ah|a[h])h?$/i, "data:image/webp;base64,UklGRtIDAABXRUJQVlA4IMYDAABQHACdASqAAIAAPu1wr1OppiSsIZVdOYAdiWcN1qWrdEKp38MuT8AhWn3To9RDY9ljCQQF82xumRF1xrotCnjeMmazggioLZNTd/u7w600LMRk6aEISq0e11RUZsLoAx0qRPMxtQYM/jKr6oaDbkansfHlYEHsskNtRAXphtnt0Gf29rOFBDMDw41tL2SCoKvfewOeX0tvOAOXdiiiT5S1A6/11hu5O2GGxg5b/ek/hC6X8QV1yBaN7G7ZfUajjoOzq2FB26HhVzPkHK0qoYRA681BrRHYK9ZMI7QBMlsJDC1pP0/M9TleMC4AAP7avE5jLWlAd7oAk+L0QyjdY3esuCvLqO/vz2CRX6diMe/qPMAImDSfV8XE4FOt2g7BZ9hhG9rYj8bZ6EYpqkCqPAi65oXMxsbSj3/IJBTzaYWySm94Pw1U+WS6posXb2aRXXaOos68ZFmgEkMpW87Hfb+nmOsw7lsJ9VNHlMAjSgDsfJgBPDvAsyRCm92eh58j3fKA8ZCzCYwpn5TU/5EZFU5G7Ks3wBtjej2U/qk15eW8uTPt3u7xDbdFE5c3W6YCWGYDsj52kkCzrCUt3i5NsjF0dg5jbNR16YZFtBgWDqp+I7Iy1U1kNqN8uxj+MpyhwF7t6ILfOolC10Zjz3ygwT/aG5uP+CMNeocbi8sEFAbYFhYyKA2o1kHAbOsFUnqUMd7Rud+S+pIMwHCQWFcgl8Cg3q3niZt0t8f+EGHSXnX2yF6BWe34PFpZ1VTZz6PD3tOqSuv+jBCc07CGiDSOpg7u4203fP1cltOpAgDHp5AuyFtBrvyLGX03IILX6N2Scn2rdfuFacpI97brY69U9SASVWTdFwf2skjni7fI1TNeVU/XoTGxzZfZn4TJQ0e0ds8wd6rxrH9eCUk19HvFYTSC9MPgDmX9IFe2ZUJvEAGGPo1ben+Szz4qxnT7efq/0h4V3xUQKuo8fFC2nki/UAWAIaf7aFq56ijZvs6bDLz0YiJR9PTWUdD+l5BUDOEd9iUjzgfQ21H5ttODOzuIQmUsWvYkfJjsofnYTjuq/hu1q4Ewm3AFGLW7gVNnW3GvSzlT70MzGUSqmS/CjHwvxkynySpEl2aIoHAAbsSuF202OQFDtIlRHhJIHixy4HDaPehbMCuSqqxDsvHP29XDum0UqMt9l9hhreMAXgp7hqnatSmLy72e5F2LuZXmeRyEAj/yEMUq6gLnHSRaSQl4CU+kdmpH37MKCgoI/ivSrTkt7MzrSq1y1YV+0egxo9hIek99If4AAAA="],
  [/^20\s*w\s*usb\s*[-–]?\s*c\s*adapter$/i, "data:image/webp;base64,UklGRl4EAABXRUJQVlA4IFIEAADQHwCdASqAAIAAPu1qrlKppSQrpBINQXAdiWcA0UgPdgEEK5XP4ky/7wPNQxQs5XJj+uyQcT5A3v8Xd6VI3yEp1HVJV4+ppCNAuz1orZA2tPyXlwCrIjCUV2y/vtOB+aSlEQMcFpClXK7utGh39tUCEJvIOyhOuNR0aFxTmF38npUP48hmdPI8vUSmCGcl/8t1Jc70a32A7NmbHou/NI7PCOkRJxaO31+y3q5PC0L7XTGxd9yNIb9smTCVhXdx8LkXh5HWt0T0UIcmoFSvZxNS2ni6RDKYdZdJ3Joy6YCm7yMCrKMfj1nfUwXnyjuuDQa/BNfhl6l0SD0MpkS2co/o+Sj5/nUVwAD+6CKCAaSOmBWpvX+onfvAuRvXJk0HuJS+CxxuGAW6Lj3gZ8KHFr+P3EKSEIKghujpUMN4BzzIjCWDJayCWgBNxEPChTqG8LEA13O5JrSIf7F//SPoAxvlHli2IIm2ubbt0MH3nu+4Zaa3JLfGCbcoUwIZlX3n5dnYKxhZYHicwX4eB76LAdJs2JExrq7ynWod02BfWuEuZbJKF/6GDAEBXRYCyosjkF2T1og9lE5NCiLgApCvAou4IXzM8B8TgWcfnKpr2HBnQRN2vIW2j2iaMR9c2/yls1JnfZzTiaPclcWBy+l7XQnriCdI7Gvugq/VCn2NszijbwdzA5VTLKxX61cWIzVnAwUcMazVLcJNAzVBuZhQbQnQPzAY4zs9UjzI/24knmJhPMV2ktoUyQ1E6fuj8GpgKIIOM678uH8ukNg3uVNnHRi2klnioT8iatgB9pcd+nlgnLnmYY51ASdDCd/0iVqiAOqEGYXkskEEfIAn5GwtQTi6hLD9oNr/CixRzPjIWgW2dL3rUKtXHk4tIkCNzcVhhFS/GpO0sQ7jLVgvb+xw35bkh0j90PFqwkA6w5EOjwq9aShrMI/KfWWTEBE7pklZVptMXzwI3B+TrCGUNpp07VtGsVO8nFkfdoVvfrXhNUHak63+UWTz8zWaHAF8/zQDkn7YKOyKRvuVGj0gqzwrQ4NyevVrMLQhc4MW/C3n9YScbNC3TTjFHrzlV1MDpdKyajozgJrNTs6S3v9YrwVx/mlagDGauNZfcGbgoh3kBo6rbP0WlUDlaJJHHyX/LuzGrVDZq1tkbCJTjFMbAtysohgT9NPyPVuvVNM6YuTfe1m65NvT6gl55cS8+uREeytY6cCVpe8XILve5V/KCJy+jIwA+BWazIIB2axFkZ5ucQliheGFcAUpOiGnJK1lIaqglwZ+BBJof1Os1cWHJe56YvgDBG32xS8c5gLm3Kc8wHsABt71jpUSqZmtSz6/mA4bSs3qUugsfj6jFOCE2uz/eXBGzbAA2k27EhSS+lFbfj0Ve+3TH8BGLqwLkcrXaIJ1KowY+nQxAUQEvtMpogDsLv5rhDbWEZYRQUdxY7oQmI61qw9Zu8Id+VMng3QoIqjmkDwAAA="],
  [/^telefon\s*ushlagichi$/i, "data:image/webp;base64,UklGRpoEAABXRUJQVlA4II4EAABQHQCdASqAAIAAPu1orlKppSQ3pRGtmvAdiWcA0jgODd6jg5Nyw3v8dlFtdvYHRVPxVEiqQLs/9xBzqGQKORL8dV07bMoq7Jwhmn92PKarNKueALdQuKKFFO6GgaLbP7dBUOdpZucCk4bJc87y2nDrrT3jw+GLPaig8/KKuozdYmlHketZF/w2eCW/TYfhy8IU6dw20/dld2iHQ2JfNo3V6ezRv8eIOXh5CTFN7ejUvN5nVyXeKW7xWmr2fxlZlfPOAmZoGU1UP+XmrBZ+VQZaW+Iq1z/jN0+pfzZ7qaLdCde0mlOUMau11T+SA5BxdRC4YsAA/tvrk7nc+4FbBC2mtQUa4CSVuD4ebTcGYBpAyoTrJIRKhxAAO2KIk5mfosI+ljZzxQm56jstfGTEtQyXTw7xjBy+W3VMTiUnzcpKLStE5UwtJvV6v1pKao+48Zbt+034+lr1XuS8/G7s+GWiHVF6+BYnVHJ719QTKRKUTIVZ1qTX5RBiHfbLPTEVmH3vwPxsTSAFC+mORBo0otjsBR1SnLfdFbhOSKG1hP+tP7t/OL8XELfifk/ChS2y+zv9xVdMiftF1IGDD/jG2nYE1pMmxmLUx/4VsKGCZ+U1SBTft3osfjq9IrYN6o9eLpV6T97nshLF4b6TZNZ94OQ7u7MueC/neoIedPZzNpzUjMoqhXSyhfIeG2OwW93Lk4RL9TXnX2wOAkaSVqW5qs+ob9RNE2ICDmaCr0BzI3ATDQyZhvorsywtBnbDBtslZpSMlhzGHFRINsu6UE3ts4qgvk65N+dwPjR+ot2CnFLXEf9ZfBEc3c9/nFQz+jI1a+PDE9o9Gcv3dgPmJQnwNzRctwDQqy6mgGtIvAE3efzOTiJ7Vwci9Sv2Ez96JDJBOCX9q7ORViIgRJt4B/knIM6jBNaztN1wRQd3kGH1RMFl5x8Uz4UI07I02RYOlwJ8QWl5OAzrUi+RG4Ac6oFxksZSpGlqDKau1ZNvcYeEgMw7kbXIj4MNDQvpSHS4SJ9NPda27UxIY0Qqz/EVhrqDG2gK4Uh9g/nLZE2pUIB/QW4H6iDWy5JWD5RYQofXlnD13oYtbj59Ip8XTh7Np9f7KStU59W/T8Kz3HkwrW9SiaRWf7tXZyEmwSn4O0I6eRBzzDlh5PBHgj8U9EQw1wsi7nyoOcp91R1VQYDs2/EdmQDZU4TPCsq6qzLedXHHvKivp2k/rKweixU/ui4GAQTROu6wjr6Llzhe3Tbv2F1gvmebVM30WCEqrrR8ABQmaBuJNZOix0FJCuGnmijRgdwV8e1gyTLeIb7r6DKfcDmkgLKO3VtVe8j7DdDoRBL2Pnc9ycuZK0qbLIfcdrrtIo39eOEsP2y26uReeVdZVGkq+0N5e5QLQcXFCqR9rljlblBobuR/uu9tQj7CWkGn4bx5inCB6irgn2+DBpdVIRrYrw08d2+M5ujs8oEXXfwBsyWN/au2E9FmL8LyqTZCQr5hcQOykoLaGKA/g98Xru3Ss+w5V1z8My5lzVLJcSNZ/IWXyt0Z243wY786khZlOQAAAA=="],
  [/^simsiz\s*sichqoncha$/i, "data:image/webp;base64,UklGRiwEAABXRUJQVlA4ICAEAACwHgCdASqAAIAAPu1urlMppam4JJOcMwAdiWUAzrGNcArBJSpUqmlYTHDu2ILpxbOB3+E+4OVAKgyuf9L7cbzcT+wLP3AOUu4CQpPedYMUDff7wVXI1DpNgtlVDHf5VMeGA8dlUZpbOV1mqMECaULOe91U0AHTV/goSewhRUxn7YVqNX/yEYvOg7tPAdozGVQ3oAxUHsgvgPK/sRf7JCL01S2Ba+0SBa5N9brfL1P35WRgZwczt90ViIFS08mrTmkF82Xb3E3PtX9ms/eKyiWijvavqaqmBAN9PUsShLMB3N8qzO3RU82kPoqFR+ILMAVCvM1fVSdDyM/n69beAAD+r6S7gIoQLjHDKR//UliM8gt8sAr8S1Sh/DgMCXMZHs8FukkS9cXLVuv2y7Gh+dndUFTr4/WTFqZ1PyMt9mkpLX0esTdrhz4wtYJiLOUMD0SkMS29PFD8B3MCmng79v3ImLGqxTjdGXVEWHAjVkA+kEz9nTQMlTPARwOj6cWhT6bGNezAhg5vZhSAL8dyR4zHkh7f8Qj4/QiJHOtdtdvKJMyBEmBWTZEQQdg6Hj9fYaLOd8Yhk2zvM40a+WsZ6ej23tj7XkE4KQ8ZOpXfj9Ny05XJedZizJ57SXFeS0cHNSMDI+0VkqOpWdKPy0cd2+5mTqePIpmeBJYvb76aMa76Gmj5Z1zcr+JkPE5T6QX045epkMO56L5jnlj/0xMObvL2//7x3YN6nUXtgmA9UE/xNLx0FG+JtPfg4A3M9A5KIEf0Zk2MrvZ4ItFvKmqx9YQMIRSnr1pLJfrI4J8EpEDLLhP/hIwAt2vRxRHm0DrMGjlcx7y6fxUrW/YWlbEfChfNxxkiM3k45elvj4vM8jt6Ppstt3mJtu+35bkNRvtB/4Q/PzGY0t4M4ZIxSQz2xkqW8FGf420qe5kz5JeaLEngXfebgSp0kuOC/CHA6efqpjt8wFACBUlFROwmCjTnxP+ltYUFIu7muJmRawBygNeok3AwctKmnZ6qq+PGP3OXtMuYIVmHSah+YQWNFNUZGlqLZLa5iaCeX7XS1tamsolcLyywPaC38pQUidgGFsiwW3vwcIimMt0tn96aBsf1ZqODK/ci0/kapZbO6eRuHW0ejzYzJ9R6xmNOE3jFLwIspdhxcSo01n0j5/vTh2h2rXJAYqfswysnQ+UdGy5HEJzE5/jmbvJRMMBJFqg3o6slAojbDt/kE/1RbbXynRQu67tM0wZJUYzUhcyJbfgMxyIpyzeSc41zfRwpuRDyym+dpdzgNFrHhkVtbh0M6LD1w7R5LvKLqJ0u4KJ2vswVzbfU+k4xPPsIb61zebCIQZrgeZ2IdVQy81D10o7MuvxM4r9fGd3Gn+sjhEdGhzj+2T5goEmNxYxTzXH/4BxRHLhoYAA="]
];
const LOCAL_PRODUCT_PREVIEWS = [
  [/^ariel\s*1[.,]?5\s*kg$/i, "/product-previews/ariel-15kg.svg"],
  [/^vanish\s*450\s*ml$/i, "/product-previews/vanish-450ml.svg"],
  [/^domestos\s*750\s*ml$/i, "/product-previews/domestos-750ml.svg"],
  [/^cif\s*krem\s*500\s*ml$/i, "/product-previews/cif-500ml.svg"]
];
function localProductPreview(product) {
  const name = String(product?.name || "").trim();
  return GENERATED_PRODUCT_PREVIEWS.find(([pattern]) => pattern.test(name))?.[1]
    || LOCAL_PRODUCT_PREVIEWS.find(([pattern]) => pattern.test(name))?.[1] || null;
}
function productImage(product) {
  const actual = String(product?.image_url || product?.image || "").trim();
  // Never overwrite a seller's existing product photo.
  if (/^https?:\/\//i.test(actual) || /^\/(?!\/)[\w./-]+$/.test(actual)) return actual;
  const name = String(product?.name || "").trim();
  return localProductPreview(product)
    || BUNDLED_PRODUCT_IMAGES.find(([pattern]) => pattern.test(name))?.[1]
    || matchedPhoto(product)?.photo || null;
}

function Icon({ name, size = 21, strokeWidth = 1.9 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7.5"/><path d="m17 17 4.3 4.3"/></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    heart: <path d="M20.5 8.8c0 4.8-8.5 10.6-8.5 10.6S3.5 13.6 3.5 8.8a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2Z"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    x: <path d="M5 5 19 19M19 5 5 19"/>,
    arrow: <path d="M4 12h16m-7-7 7 7-7 7"/>,
    chevron: <path d="m9 6 6 6-6 6"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    minus: <path d="M5 12h14"/>,
    filter: <><path d="M4 7h16M7 12h10M10 17h4"/></>,
    truck: <><path d="M3 6h12v12H3zM15 10h3l3 4v4h-6z"/><circle cx="7" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></>,
    shield: <><path d="m12 2 8 4v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6l8-4Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></>,
    check: <path d="m5 12 4.5 4.5L19 7"/>,
    refresh: <><path d="M20 8a8 8 0 0 0-14-2L4 8"/><path d="M4 3v5h5M4 16a8 8 0 0 0 14 2l2-2"/><path d="M20 21v-5h-5"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/></>,
    pencil: <><path d="m4 17-.5 3.5L7 20l12-12-3-3L4 17ZM14 7l3 3"/></>,
    package: <><path d="m12 2 9 5-9 5-9-5 9-5ZM3 7v10l9 5 9-5V7M12 12v10"/></>,
    home: <path d="m3 11 9-8 9 8v10h-7v-7h-4v7H3V11Z"/>,
    logout: <><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10"/></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    spark: <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>,
    star: <path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-4.9 7-1L12 2Z"/>,
    bottle: <><path d="M9 2h6v4l2 3v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9l2-3V2Z"/><path d="M7 12h10M9 6h6"/></>,
    utensils: <><path d="M4 2v7a3 3 0 0 0 6 0V2M7 2v20M18 2c-3 2-3 6-3 10h4V2h-1ZM19 12v10"/></>,
    gift: <><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M2 9h20M12 9v12M12 9C2 8 5 2 9 3c2 1 3 6 3 6Zm0 0c10-1 7-7 3-6-2 1-3 6-3 6Z"/></>,
    droplet: <path d="M12 2C8 8 5 11 5 15a7 7 0 0 0 14 0c0-4-3-7-7-13Z"/>,
    laptop: <><rect x="4" y="4" width="16" height="13" rx="1"/><path d="m2 21 2-4h16l2 4H2Z"/></>,
    shirt: <path d="m8 3 4 3 4-3 5 4-3 5-2-1v10H8V11l-2 1-3-5 5-4Z"/>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths[name] || paths.spark}
  </svg>;
}
function ProductPicture({ product, className = "", eager = false }) {
  const primaryUrl = productImage(product);
  const previewUrl = localProductPreview(product);
  const [failedUrl, setFailedUrl] = useState("");
  useEffect(() => setFailedUrl(""), [primaryUrl, previewUrl]);
  // Failed seller hotlinks fall back to local previews, not an unrelated picture.
  const url = failedUrl === primaryUrl ? (previewUrl && previewUrl !== primaryUrl ? previewUrl : null)
    : (failedUrl === previewUrl ? null : primaryUrl);
  if (!url) {
    // Original product-type illustration, clearly labelled as not a seller photo.
    return <div className={"nm-art mm-image-fallback mm-illustrated-fallback " + className}>
      <ProductIllustration product={product}/>
    </div>;
  }
  const hasSellerPhoto = Boolean(String(product?.image_url || product?.image || "").trim());
  return <div className={"nm-product-image " + className}>
    <img loading={eager ? "eager" : "lazy"} decoding="async" src={url}
      alt={hasSellerPhoto ? product.name : product.name + " — namunaviy surat"}
      onError={() => setFailedUrl(url)} referrerPolicy="no-referrer" draggable="false" />
    {(url === previewUrl || !hasSellerPhoto) && <span className="mm-image-sample-caption">
      {url === previewUrl ? "Namuna vizual" : "Namuna rasm"}
    </span>}
  </div>;
}
function useDialogFocus(ref, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = ref.current;
    const selector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const candidates = () => [...(dialog?.querySelectorAll(selector) || [])].filter(el => el.getClientRects().length);
    candidates()[0]?.focus();
    const handler = event => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); }
      if (event.key !== "Tab") return;
      const nodes = candidates();
      if (!nodes.length) { event.preventDefault(); return; }
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog?.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog?.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => { document.removeEventListener("keydown", handler); previousFocus?.focus?.(); };
  }, [ref]);
}
function Modal({ title, onClose, children, wide = false, className = "" }) {
  const ref = useRef(null);
  useDialogFocus(ref, onClose);
  return <div className="nm-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={ref} className={"nm-dialog " + (wide ? "nm-dialog-wide " : "") + className}
      role="dialog" aria-modal="true" aria-label={title}>
      <div className="nm-dialog-heading">
        <h2>{title}</h2><button type="button" className="nm-icon-btn" aria-label="Yopish" onClick={onClose}><Icon name="x"/></button>
      </div>
      {children}
    </section>
  </div>;
}
function ProductCard({ product, language, onAdd, onFavorite, favorite, onOpen, eager = false }) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return undefined;
    const timer = setTimeout(() => setAdded(false), 1100);
    return () => clearTimeout(timer);
  }, [added]);
  const out = Number(product.stock) <= 0;
  const old = Number(product.old_price);
  const price = Number(product.price);
  const discount = old > price ? Math.round((1 - price / old) * 100) : 0;
  const recent = product.created_at && Date.now() - new Date(product.created_at).getTime() < 14 * 86400000;
  return <article className="nm-card mm-product-card">
    <div className="nm-card-photo mm-card-media">
      <button type="button" className="mm-card-image-trigger"
        onClick={() => onOpen(product)} aria-label={product.name + " — batafsil"}>
        <ProductPicture product={product} eager={eager}/>
      </button>
      <div className="nm-card-badges">
        {discount > 0 && <span className="nm-sale-tag">-{discount}%</span>}
        {recent && <span className="nm-new-tag">NEW</span>}
      </div>
      <button type="button" className={"nm-love " + (favorite ? "active" : "")}
        onClick={() => onFavorite(product.id)}
        aria-label={favorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo‘shish"}
        aria-pressed={favorite}>
        <Icon name="heart" size={19}/>
      </button>
      <button type="button" className="mm-quick-look" onClick={() => onOpen(product)}>
        <Icon name="eye" size={16}/> {language === "ru" ? "Подробнее" : language === "en" ? "Quick view" : "Batafsil"}
      </button>
    </div>
    <div className="nm-card-body mm-card-body">
      <p className="nm-card-category">{product.category}</p>
      <button type="button" className="nm-card-title" onClick={() => onOpen(product)}>{product.name}</button>
      <div className="mm-product-meta">
        <span className={out ? "nm-stock nm-out" : "nm-stock"}>
          <i/>{WORD(language, out ? "unavailable" : "available")}
        </span>
        {product.seller_name && <span className="mm-seller-label">{product.seller_name}</span>}
      </div>
      <div className="nm-card-prices">
        <strong>{money(price)}</strong>
        {discount > 0 && <s>{money(old)}</s>}
      </div>
      <button type="button" className={"nm-add-btn mm-card-add " + (added ? "mm-added" : "")}
        onClick={() => { if (onAdd(product)) setAdded(true); }}
        disabled={out} aria-label={WORD(language, "add") + ": " + product.name}>
        <span>{added ? (language === "ru" ? "Добавлено" : language === "en" ? "Added" : "Qo‘shildi") : WORD(language, "add")}</span>
        <Icon name={added ? "check" : "plus"} size={18}/>
      </button>
    </div>
  </article>;
}
function AuthPanel({ language, onClose, onSuccess, notify }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("buyer");
  const [busy, setBusy] = useState(false);
  const googleSlot = useRef(null);
  useEffect(() => {
    if (mode !== "login") return undefined;
    let timer;
    let cancelled = false;
    const init = () => {
      if (cancelled) return;
      if (!window.google?.accounts?.id || !googleSlot.current) {
        timer = setTimeout(init, 350); return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async response => {
          try {
            const data = await api("/auth/google", { method: "POST", data: { credential: response.credential } });
            if (!data.user || !data.token) throw new Error("Google login javobi to‘liq emas");
            onSuccess(data.user, data.token);
          } catch (error) { notify(error.message, "error"); }
        }
      });
      googleSlot.current.replaceChildren();
      window.google.accounts.id.renderButton(googleSlot.current, {
        theme: "outline", size: "large", shape: "pill", text: "signin_with", width: 300
      });
    };
    init();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [mode]);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = {
      email: form.elements.email.value.trim().toLowerCase(),
      password: form.elements.password.value
    };
    if (mode === "register") {
      data.name = form.elements.name.value.trim();
      data.role = role;
    }
    setBusy(true);
    try {
      const result = await api("/auth/" + (mode === "register" ? "register" : "login"),
        { method: "POST", data });
      if (!result.user || !result.token) throw new Error("Server javobi noto‘g‘ri");
      onSuccess(result.user, result.token);
    } catch (error) { notify(error.message, "error"); }
    finally { setBusy(false); }
  }
  return <Modal title={mode === "login" ? WORD(language, "loginTitle") : WORD(language, "createAccount")} onClose={onClose}>
    <div className="nm-auth-switch">
      <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">{WORD(language, "signin")}</button>
      <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">{WORD(language, "signup")}</button>
    </div>
    <form className="nm-form" onSubmit={submit}>
      {mode === "register" && <label>{WORD(language, "yourName")}<input name="name" minLength={2} maxLength={100} autoComplete="name" required placeholder="Ismingiz"/></label>}
      <label>{WORD(language, "email")}<input name="email" type="email" autoComplete="email" required placeholder="you@gmail.com"/></label>
      <label>{WORD(language, "password")}<input name="password" type="password" minLength={8}
        autoComplete={mode === "register" ? "new-password" : "current-password"} required placeholder="Kamida 8 ta belgi"/></label>
      {mode === "register" && <label>{WORD(language, "account")}
        <select value={role} onChange={event => setRole(event.target.value)}>
          <option value="buyer">{WORD(language, "buyer")}</option>
          <option value="seller">{WORD(language, "sellerRole")}</option>
        </select></label>}
      <button className="nm-primary nm-full" type="submit" disabled={busy}>
        {busy ? "⏳" : WORD(language, mode === "register" ? "signup" : "signin")} <Icon name="arrow" size={18}/>
      </button>
    </form>
    {mode === "login" && <>
      <div className="nm-or"><span>yoki</span></div>
      <div className="nm-google" ref={googleSlot}/>
      <p className="nm-form-note">{language === "en" ? "Existing email account? Sign in with your password first, then connect Google from your account." : language === "ru" ? "Если этот адрес уже зарегистрирован, войдите по паролю и подключите Google в кабинете." : "Bu email avval ro‘yxatdan o‘tgan bo‘lsa, avval parol bilan kiring va kabinetingizda Google akkauntni bog‘lang."}</p>
    </>}
  </Modal>;
}
function CartPanel({ language, cart, products, onClose, onBrowse, onQty, onRemove, onCheckout }) {
  const drawerRef = useRef(null);
  useDialogFocus(drawerRef, onClose);
  const byId = new Map(products.map(p => [String(p.id), p]));
  const total = cart.reduce((sum, item) => {
    const product = byId.get(String(item.id));
    return sum + (Number(product?.price ?? item.price) || 0) * item.quantity;
  }, 0);
  const hasUnavailable = cart.some(item => {
    const product = byId.get(String(item.id));
    return !product || product.is_active === false || Number(product.stock) < item.quantity;
  });
  return <div className="nm-drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <aside ref={drawerRef} className="nm-cart-drawer" role="dialog" aria-modal="true" aria-label={WORD(language,"cart")}>
      <div className="nm-drawer-top"><h2><Icon name="bag"/> {WORD(language,"cart")}</h2>
        <button className="nm-icon-btn" type="button" aria-label="Yopish" onClick={onClose}><Icon name="x"/></button>
      </div>
      {cart.length === 0 ? <div className="nm-empty-cart"><span>🛒</span><h3>{WORD(language,"emptyCart")}</h3>
        <button className="nm-primary" type="button" onClick={onBrowse}>{WORD(language,"browse")}</button></div> :
        <>
          <div className="nm-cart-items">{cart.map(item => {
            const product = byId.get(String(item.id)) || item;
            return <div className="nm-cart-item" key={item.id}>
              <ProductPicture product={product}/>
              <div className="nm-cart-item-main"><strong>{product.name}</strong><span>{money(product.price)}</span>
                 {(!byId.has(String(item.id)) || Number(product.stock) < item.quantity) && <small className="mm-cart-item-warning">
                   {language === "en" ? "Availability changed — remove or reduce quantity" : language === "ru" ? "Остаток изменился — удалите или уменьшите количество" : "Miqdor o‘zgargan — mahsulotni olib tashlang yoki kamaytiring"}
                 </small>}
                <div className="nm-stepper">
                  <button type="button" onClick={() => onQty(item.id, -1)} aria-label="Kamaytirish"><Icon name="minus" size={15}/></button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => onQty(item.id, 1)}
                     disabled={item.quantity >= Number(product.stock ?? 0)}
                     aria-label="Ko‘paytirish"><Icon name="plus" size={15}/></button>
                </div>
              </div>
              <button className="nm-remove" type="button" aria-label="O‘chirish" onClick={() => onRemove(item.id)}><Icon name="trash" size={19}/></button>
            </div>;
          })}</div>
          <div className="nm-cart-footer">
            <p className="nm-total"><span>{WORD(language,"total")}</span><strong>{money(total)}</strong></p>
            <small>{WORD(language,"notice")}</small>
            {hasUnavailable && <p className="mm-cart-warning" role="status">{language === "en" ? "Review unavailable items before checkout." : language === "ru" ? "Проверьте недоступные товары перед заказом." : "Buyurtmadan oldin mavjud bo‘lmagan mahsulotlarni tekshiring."}</p>}
            <button className="nm-primary nm-full" type="button" disabled={hasUnavailable} onClick={onCheckout}>{WORD(language,"buy")} <Icon name="arrow" size={18}/></button>
          </div>
        </>}
    </aside>
  </div>;
}
function CheckoutPanel({ language, user, cart, onClose, onSuccess, notify }) {
  const [busy, setBusy] = useState(false);
  const submittingRef = useRef(false);
  async function submit(event) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setBusy(true);
    const form = event.currentTarget;
    const payload = {
      customer_name: form.elements.customer_name.value.trim(),
      phone: form.elements.phone.value.trim(),
      address: form.elements.address.value.trim(),
      note: form.elements.note.value.trim(),
      items: cart.map(item => ({ product_id: Number(item.id), quantity: item.quantity }))
    };
    try {
      if (!payload.customer_name || !payload.phone || !payload.address || !payload.items.length) throw new Error("Ma’lumotlarni to‘ldiring");
      const order = await api("/orders", { method: "POST", data: payload, token: user.token });
      onSuccess(order);
    } catch (error) { notify(error.message, "error"); }
    finally { submittingRef.current = false; setBusy(false); }
  }
  return <Modal title={WORD(language,"buy")} onClose={onClose}>
    <form onSubmit={submit} className="nm-form">
      <label>{WORD(language,"yourName")}<input name="customer_name" required defaultValue={user.name || ""} autoComplete="name"/></label>
      <label>{WORD(language,"phone")}<input name="phone" type="tel" required minLength={9} placeholder="+998 90 123 45 67" autoComplete="tel"/></label>
      <label>{WORD(language,"address")}<textarea name="address" required rows={2} placeholder="Shahar, tuman, ko‘cha, uy"/></label>
      <label>{WORD(language,"note")}<textarea name="note" rows={2} placeholder="Masalan, 3-qavat"/></label>
      <div className="nm-payment-note"><Icon name="shield" size={22}/><span>{WORD(language,"payment")}</span></div>
      <button className="nm-primary nm-full" type="submit" disabled={busy}>
        {busy ? "⏳ Yuborilmoqda..." : WORD(language,"order")} <Icon name="check" size={19}/>
      </button>
    </form>
  </Modal>;
}

function ProductPanel({ product, language, onClose, onAdd, favorite, onFavorite }) {
  const [quantity, setQuantity] = useState(1);
  const stock = Math.max(0, Math.floor(Number(product.stock) || 0));
  const canBuy = stock > 0;
  const unitPrice = Number(product.price) || 0;
  const oldPrice = Number(product.old_price);
  const discount = oldPrice > unitPrice ? Math.round((1 - unitPrice / oldPrice) * 100) : 0;
  const detailText = {
    uz: { title:"Mahsulot haqida", photo:"Mahsulot rasmi", code:"Mahsulot kodi", description:"Tavsif", emptyDescription:"Mahsulot haqida batafsil tavsif hali kiritilmagan.", seller:"Sotuvchi", stock:"Omborda", pieces:"dona", total:"Jami", qty:"Miqdor", add:"Savatchaga qo‘shish", available:"Sotuvda mavjud", unavailable:"Hozircha mavjud emas", favorite:"Sevimlilarga qo‘shish", unfavorite:"Sevimlilardan olib tashlash", disclaimer:"Rasm va qadoq ma’lumotlarini sotuvchi bilan aniqlashtiring." },
    ru: { title:"О товаре", photo:"Фото товара", code:"Код товара", description:"Описание", emptyDescription:"Подробное описание товара пока не добавлено.", seller:"Продавец", stock:"В наличии", pieces:"шт.", total:"Итого", qty:"Количество", add:"В корзину", available:"В наличии", unavailable:"Нет в наличии", favorite:"В избранное", unfavorite:"Убрать из избранного", disclaimer:"Уточняйте изображение и упаковку у продавца." },
    en: { title:"Product details", photo:"Product image", code:"Product ID", description:"Description", emptyDescription:"A detailed product description has not been added yet.", seller:"Seller", stock:"In stock", pieces:"pcs", total:"Total", qty:"Quantity", add:"Add to cart", available:"In stock", unavailable:"Out of stock", favorite:"Add to favorites", unfavorite:"Remove from favorites", disclaimer:"Please confirm packaging and product image with the seller." }
  }[language] || {};
  const verifiedUrl = photoReferenceStatus(product) === "uploaded";
  const hasSellerImage = !!String(product.image_url || "").trim();
  return <Modal title={detailText.title} onClose={onClose} wide className="mm-product-modal">
    <div className="mm-product-detail">
      <div className="mm-product-gallery">
        <div className="mm-product-gallery-top">
          <span className="mm-product-gallery-label"><Icon name="bag" size={15}/>{detailText.photo}</span>
          <button type="button" className={"mm-product-gallery-fav " + (favorite ? "active" : "")}
            onClick={() => onFavorite(product.id)} aria-pressed={favorite}
            aria-label={favorite ? detailText.unfavorite : detailText.favorite}>
            <Icon name="heart" size={20}/>
          </button>
        </div>
        <ProductPicture product={product} className="nm-detail-picture mm-product-hero-photo" eager/>
        <div className="mm-product-gallery-bottom">
          <span>MiniMarket</span><span>{detailText.code}: #{product.id}</span>
        </div>
      </div>
      <div className="mm-product-details-column">
        <div className="mm-product-identity">
          <span className="mm-product-category">{product.category}</span>
          <h2>{product.name}</h2>
          <div className="mm-product-availability">
            <span className={canBuy ? "mm-product-stock-pill" : "mm-product-stock-pill mm-product-sold-out"}>
              <i/>{canBuy ? detailText.available : detailText.unavailable}
            </span>
            {canBuy && <span className="mm-product-remaining">{detailText.stock}: {stock} {detailText.pieces}</span>}
          </div>
        </div>
        <div className="mm-product-pricing">
          <span className="mm-product-price-kicker">{language === "en" ? "Price" : language === "ru" ? "Цена" : "Narxi"}</span>
          <div className="mm-product-price-row">
            <strong className="mm-product-current-price">{money(unitPrice)}</strong>
            {discount > 0 && <span className="mm-product-discount">-{discount}%</span>}
          </div>
          {discount > 0 && <del className="mm-product-old-price">{money(oldPrice)}</del>}
        </div>
        <section className="mm-product-description" aria-label={detailText.description}>
          <h3>{detailText.description}</h3>
          <p>{product.description?.trim() || detailText.emptyDescription}</p>
        </section>
        {product.seller_name && <div className="mm-product-seller">
          <span className="mm-product-seller-avatar" aria-hidden="true">{product.seller_name.charAt(0).toUpperCase()}</span>
          <span><small>{detailText.seller}</small><strong>{product.seller_name}</strong></span>
          <Icon name="check" size={17}/>
        </div>}
        {hasSellerImage && !verifiedUrl && <p className="mm-product-image-note">
          <Icon name="shield" size={16}/>{detailText.disclaimer}
        </p>}
        <div className="mm-product-purchase">
          <div className="mm-product-purchase-top">
            <label id="mm-product-quantity-label">{detailText.qty}</label>
            <div className="nm-stepper nm-stepper-large mm-product-quantity" aria-labelledby="mm-product-quantity-label">
              <button type="button" aria-label="−" disabled={!canBuy || quantity <= 1}
                onClick={() => setQuantity(n => Math.max(1, n - 1))}><Icon name="minus" size={19}/></button>
              <output aria-live="polite">{quantity}</output>
              <button type="button" aria-label="+" disabled={!canBuy || quantity >= stock}
                onClick={() => setQuantity(n => Math.min(stock, n + 1))}><Icon name="plus" size={19}/></button>
            </div>
            <div className="mm-product-total"><small>{detailText.total}</small><strong>{money(unitPrice * quantity)}</strong></div>
          </div>
          <div className="nm-detail-actions mm-product-purchase-actions">
            <button className="nm-primary" type="button" disabled={!canBuy}
              onClick={() => { if (onAdd(product, quantity)) onClose(); }}>
              <Icon name="bag" size={19}/>{detailText.add}<Icon name="arrow" size={18}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Modal>;
}
function LinkGooglePanel({ user, language, onClose, notify }) {
  const slot = useRef(null);
  const [status, setStatus] = useState("waiting");
  useEffect(() => {
    let cancelled = false;
    let timeoutId;
    let tries = 0;
    const init = () => {
      if (cancelled || !slot.current) return;
      if (!window.google?.accounts?.id) {
        tries += 1;
        if (tries < 30) timeoutId = setTimeout(init, 400);
        else setStatus("unavailable");
        return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async response => {
          if (cancelled) return;
          setStatus("linking");
          try {
            await api("/auth/google/link", {
              method: "POST",
              token: user.token,
              data: { credential: response.credential }
            });
            if (!cancelled) {
              notify(language === "en" ? "Google account linked!" :
                language === "ru" ? "Google-аккаунт привязан!" : "Google akkauntingiz bog‘landi!");
              onClose();
            }
          } catch (error) {
            if (!cancelled) {
              notify(error.message, "error");
              setStatus("ready");
            }
          }
        }
      });
      slot.current.replaceChildren();
      window.google.accounts.id.renderButton(slot.current, {
        theme: "outline", size: "large", shape: "pill", width: 280
      });
      setStatus("ready");
    };
    init();
    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, [user.token, language, notify, onClose]);
  return <Modal title={language === "en" ? "Connect Google" :
    language === "ru" ? "Привязать Google" : "Google akkauntni bog‘lash"} onClose={onClose}>
    <div className="mm-link-google-panel">
      <Icon name="shield" size={35}/>
      <p>{language === "en" ? "For your security, Google must verify the same email as your MiniMarket account." :
        language === "ru" ? "Для безопасности адрес Google должен совпадать с адресом MiniMarket." :
        "Xavfsizlik uchun Google emailingiz MiniMarket akkauntingizdagi email bilan bir xil bo‘lishi kerak."}</p>
      <strong>{user.email}</strong>
      <div ref={slot} className="nm-google"/>
      {status === "linking" && <span>⏳ {WORD(language,"loading")}</span>}
      {status === "unavailable" && <span>{language === "en" ? "Google sign-in is unavailable. Please try again later." :
        language === "ru" ? "Google временно недоступен." : "Google xizmati hozircha yuklanmadi. Keyinroq qayta urinib ko‘ring."}</span>}
    </div>
  </Modal>;
}
// Brief in-memory order snapshot. Never save authenticated order history to disk.
let cachedOrderHistory = null;
function AccountPanel({ user, language, onClose, notify, onLinkGoogle }) {
  const initial = cachedOrderHistory?.token === user.token ? cachedOrderHistory.orders : null;
  const [orders, setOrders] = useState(() => initial || []);
  const [busy, setBusy] = useState(() => !initial);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    // With cached data the user can read previous orders immediately.
    const cached = cachedOrderHistory?.token === user.token ? cachedOrderHistory.orders : null;
    if (!cached) setBusy(true);
    setSlow(false);
    setError("");
    const slowTimer = setTimeout(() => { if (active && !cached) setSlow(true); }, 4000);
    api("/orders/mine", { token: user.token, signal: controller.signal, timeoutMs: 45000 })
      .then(data => {
        if (!active) return;
        const next = Array.isArray(data) ? data : [];
        cachedOrderHistory = { token: user.token, orders: next };
        setOrders(next);
      })
      .catch(err => {
        if (!active || controller.signal.aborted) return;
        setError(err.message || "Buyurtmalarni yuklab bo‘lmadi");
      })
      .finally(() => {
        clearTimeout(slowTimer);
        if (active) { setBusy(false); setSlow(false); }
      });
    return () => { active = false; controller.abort(); clearTimeout(slowTimer); };
  }, [user.token, refresh]);
  return <Modal title={WORD(language,"yourOrders")} onClose={onClose} wide>
    <div className="nm-account-head"><div className="nm-avatar">{user.name?.charAt(0)?.toUpperCase() || "M"}</div>
      <div><strong>{user.name}</strong><span>{user.email}</span></div></div>
    <div className="mm-account-tool"><button type="button" onClick={onLinkGoogle}>
      <Icon name="shield" size={18}/>
      {language === "en" ? "Connect Google sign-in" : language === "ru" ? "Привязать Google" : "Google orqali kirishni bog‘lash"}
      <Icon name="arrow" size={16}/></button></div>
    {busy ? <div className="mm-orders-wait" role="status">
      <Icon name="clock" size={25}/>
      <p>{language === "en" ? "Loading your orders..." : language === "ru" ? "Загружаем ваши заказы..." : "Buyurtmalaringiz yuklanmoqda..."}</p>
      {slow && <p className="mm-orders-slow">{language === "en" ? "The server is responding slowly. Your orders are safe; this can take longer after inactivity." :
        language === "ru" ? "Сервер отвечает медленно. Пожалуйста, попробуйте ещё раз, если загрузка не завершится." :
        "Server sekin javob beryapti. Yuklanish tugamasa, qayta urinib ko‘ring."}</p>}
    </div> :
      error && orders.length === 0 ? <div className="mm-orders-error" role="alert">
        <Icon name="alert" size={28}/>
        <p>{error}</p>
        <button type="button" className="nm-primary" onClick={() => setRefresh(n => n + 1)}>
          {language === "en" ? "Try again" : language === "ru" ? "Повторить" : "Qayta urinish"}
        </button>
      </div> :
      orders.length === 0 ? <div className="nm-no-orders"><Icon name="package" size={38}/><p>Hozircha buyurtmalaringiz yo‘q.</p></div> :
      <div className="nm-order-list">{orders.map(order => <article className="nm-order" key={order.id}>
        <div className="nm-order-head"><strong>Buyurtma #{order.id}</strong><span>{order.status || "Yangi"}</span></div>
        <p>{money(order.total_amount)} · {new Date(order.created_at).toLocaleDateString("uz-UZ")}</p>
        <div>{order.items?.map(item => <div key={item.id} className="nm-order-item mm-order-item">
          <div className="mm-order-item-head"><strong>{item.product_name} × {item.quantity}</strong>
            <span>{item.status || "Yangi"}</span></div>
          <div className="mm-order-delivery">
            <Icon name="truck" size={17}/>
            {deliveryDate(item.estimated_delivery_at, language)
              ? <span>{language === "en" ? "Expected delivery" : language === "ru" ? "Ожидаемая доставка" : "Taxminiy yetkazish"}: <strong>{deliveryDate(item.estimated_delivery_at, language)}</strong> (Toshkent vaqti)</span>
              : <span>{item.status === "Yetkazilgan" ?
                (language === "en" ? "Delivered" : language === "ru" ? "Доставлено" : "Yetkazilgan") :
                (language === "en" ? "Delivery time will appear when the seller confirms" :
                  language === "ru" ? "Время доставки появится после подтверждения продавцом" :
                  "Sotuvchi buyurtmani qabul qilgach, vaqt shu yerda chiqadi")}</span>}
          </div>
        </div>)}</div>
      </article>)}</div>}
  </Modal>;
}
function SellerOrderRow({ order, language, busy, onSave }) {
  const [status,setStatus] = useState(order.status || "Yangi");
  const [date,setDate] = useState(tashkentDateInput(order.estimated_delivery_at));
  const [dirty,setDirty] = useState(false);
  useEffect(() => {
    if (dirty) return;
    setStatus(order.status || "Yangi");
    setDate(tashkentDateInput(order.estimated_delivery_at));
  }, [order.status,order.estimated_delivery_at,dirty]);
  const existingDate = deliveryDate(order.estimated_delivery_at,language);
  const needsDate = status === "Jarayonda";
  const invalid = needsDate && (!date || Date.parse(date+":00+05:00") <= Date.now());
  return <div className="nm-seller-order mm-seller-order" key={order.item_id}>
    <div className="mm-seller-order-info">
      <strong>#{order.order_id} · {order.product_name}</strong>
      <p>{order.customer_name} · {order.phone}</p>
      <small>{order.address}</small>
      <p>{order.quantity} dona · {money(order.unit_price)}</p>
      {existingDate && <p className="mm-order-current-eta"><Icon name="truck" size={17}/> {language === "en" ? "Scheduled" : language === "ru" ? "Запланировано" : "Belgilangan muddat"}: {existingDate}</p>}
    </div>
    <div className="mm-seller-order-actions">
      <label>{language === "en" ? "Order status" : language === "ru" ? "Статус" : "Buyurtma holati"}
        <select value={status} disabled={busy} onChange={e=>{setStatus(e.target.value);setDirty(true);}}>
          <option value="Yangi">{language === "en" ? "New" : language === "ru" ? "Новый" : "Yangi"}</option>
          <option value="Jarayonda">{language === "en" ? "Accepted / preparing" : language === "ru" ? "Принят / готовится" : "Qabul qilindi / tayyorlanmoqda"}</option>
          <option value="Yetkazilgan">{language === "en" ? "Delivered" : language === "ru" ? "Доставлено" : "Yetkazilgan"}</option>
        </select>
      </label>
      <label>{language === "en" ? "Expected delivery (Tashkent time)" : language === "ru" ? "План доставки (Ташкент)" : "Taxminiy yetkazish (Toshkent vaqti)"}
        <input type="datetime-local" value={date} disabled={busy}
          onChange={e=>{setDate(e.target.value);setDirty(true);}}/>
      </label>
      {invalid && <small className="mm-eta-validation">
        {language === "en" ? "Enter a future delivery date and time to accept." :
         language === "ru" ? "Для принятия укажите будущую дату и время." :
         "Qabul qilish uchun kelajakdagi sana va vaqtni belgilang."}
      </small>}
      <button type="button" className="nm-primary mm-order-save" disabled={busy || invalid || !dirty}
        onClick={async()=>{
          const valid = !date || !Number.isNaN(Date.parse(date+":00+05:00"));
          if(!valid) return;
          const saved=await onSave(order,status,date ? new Date(date+":00+05:00").toISOString() : null);
          if(saved) setDirty(false);
        }}>
        <Icon name="check" size={17}/> {language === "en" ? "Save update" : language === "ru" ? "Сохранить" : "Buyurtmani saqlash"}
      </button>
    </div>
  </div>;
}
function SellerPanel({ user, language, onClose, notify, onProductsChanged, onLinkGoogle }) {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [edit, setEdit] = useState(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [onlyMissingPhotos, setOnlyMissingPhotos] = useState(false);
  // Name-based sample image mappings are NOT proof of a seller-owned product photo.
  const activeSellerProducts = products.filter(p => p.is_active !== false);
  const missingPhotos = activeSellerProducts.filter(p =>
    ["missing", "invalid"].includes(photoReferenceStatus(p)));
  const externalPhotos = activeSellerProducts.filter(p =>
    photoReferenceStatus(p) === "external_unverified");
  const uploadedPhotos = activeSellerProducts.filter(p =>
    photoReferenceStatus(p) === "uploaded");
  const visibleSellerProducts = onlyMissingPhotos ? missingPhotos : products;
  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      api("/seller/products", { token: user.token }),
      api("/seller/orders", { token: user.token })
    ]).then(([p,o]) => {
      if (!alive) return;
      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
    }).catch(error => { if (alive) notify(error.message, "error"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user.token, reload]);
  async function save(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const f = form.elements;
    const photo = f.photo?.files?.[0];
    const payload = {
      name: f.name.value.trim(), description: f.description.value.trim(),
      price: Number(f.price.value), category: f.category.value,
      image_url: f.image_url.value.trim(), stock: Number(f.stock.value),
      old_price: f.old_price.value ? Number(f.old_price.value) : null,
      discount_percent: 0
    };
    if (!Number.isSafeInteger(payload.price) || payload.price <= 0 ||
        !Number.isSafeInteger(payload.stock) || payload.stock < 0 || !payload.name || !payload.description) {
      notify("Mahsulot nomi, tavsifi, narxi va sonini tekshiring", "error"); return;
    }
    setBusy(true);
    try {
      const result = await api(edit ? "/products/" + edit.id : "/products", {
        method: edit ? "PUT" : "POST", token: user.token, data: payload
      });
      if(photo) {
        try { await uploadProductPhoto(edit?.id || result.id, photo, user.token); }
        catch(error) {
          setReload(n=>n+1);onProductsChanged();
          notify("Mahsulot saqlandi, lekin rasm yuklanmadi: " + error.message,"error");
          return;
        }
      }
      setEditing(false); setEdit(null); setReload(n => n + 1); onProductsChanged();
      notify("✅ Mahsulot saqlandi");
    } catch (error) { notify(error.message, "error"); }
    finally { setBusy(false); }
  }
  async function remove(product) {
    if (!window.confirm("“" + product.name + "” mahsulotini o‘chirishni tasdiqlaysizmi?")) return;
    setBusy(true);
    try {
      await api("/products/" + product.id, { method: "DELETE", token: user.token });
      setReload(n => n + 1); onProductsChanged(); notify("Mahsulot o‘chirildi");
    } catch (error) { notify(error.message, "error"); }
    finally { setBusy(false); }
  }
  async function statusUpdate(order, status, estimated_delivery_at) {
    setBusy(true);
    try {
      await api("/seller/orders/" + order.item_id, {
        method: "PATCH", token: user.token, data: { status, estimated_delivery_at }
      });
      setReload(n => n + 1); notify("✅ Buyurtma holati va yetkazish vaqti saqlandi");
      return true;
    } catch (error) { notify(error.message, "error"); return false; }
    finally { setBusy(false); }
  }
  return <Modal title={WORD(language,"seller")} onClose={onClose} wide>
    <div className="mm-seller-connect"><button type="button" onClick={onLinkGoogle}>
      <Icon name="shield" size={16}/> {language === "en" ? "Connect Google" :
        language === "ru" ? "Привязать Google" : "Google akkauntni bog‘lash"}</button></div>
    <div className="nm-seller-tabs">
      <button type="button" className={tab === "products" ? "active" : ""} onClick={() => { setTab("products"); setEditing(false); }}>{WORD(language,"myProducts")} ({products.length})</button>
      <button type="button" className={tab === "orders" ? "active" : ""} onClick={() => { setTab("orders"); setEditing(false); }}>{WORD(language,"orders")} ({orders.length})</button>
    </div>
    {loading ? <p className="nm-inline-wait">⏳ Yuklanmoqda...</p> : tab === "products" ?
      editing ? <form key={edit?.id || "new"} className="nm-form nm-product-form" onSubmit={save}>
        <button className="nm-link-btn" type="button" onClick={() => setEditing(false)}>← {WORD(language,"back")}</button>
        <label>{WORD(language,"name")}<input name="name" defaultValue={edit?.name || ""} required maxLength={180}/></label>
        <label>{WORD(language,"description")}<textarea name="description" rows={3} required defaultValue={edit?.description || ""}/></label>
        <label>{WORD(language,"category")}<select name="category" defaultValue={edit?.category || CATEGORIES[0][0]}>
          {CATEGORIES.map(([name,emoji]) => <option key={name} value={name}>{emoji} {name}</option>)}
        </select></label>
        <div className="nm-form-cols">
          <label>{WORD(language,"price")} (so‘m)<input name="price" type="number" min={1} step={1} required defaultValue={edit?.price || ""}/></label>
          <label>{WORD(language,"stock")}<input name="stock" type="number" min={0} step={1} required defaultValue={edit?.stock ?? 10}/></label>
        </div>
        {edit && <label>Eski narx (ixtiyoriy)<input name="old_price" type="number" min={1} step={1} defaultValue={edit.old_price || ""}/></label>}
        {!edit && <input type="hidden" name="old_price" value=""/>}
        <label>Mahsulot rasmini kompyuterdan yuklash
          <input name="photo" type="file" accept="image/jpeg,image/png,image/webp"/>
          <small>JPEG, PNG, WebP · 1.5 MB gacha. Surat mahsulotga mos bo‘lishi kerak.</small>
        </label>
        <label>{WORD(language,"image")} (havola, ixtiyoriy)
          <input name="image_url" type="text" placeholder="https://... yoki /api/product-images/..." defaultValue={edit?.image_url || ""}/>
        </label>
        {edit && <div className="mm-seller-photo-preview"><ProductPicture product={edit}/><span>Hozirgi mahsulot rasmi</span></div>}
        <button className="nm-primary nm-full" type="submit" disabled={busy}>{busy ? "⏳" : WORD(language,"save")}</button>
      </form> :
      <div className="nm-seller-content">
        <button className="nm-primary nm-add-product" type="button" onClick={() => { setEdit(null); setEditing(true); }}><Icon name="plus"/>{WORD(language,"newProduct")}</button>
        <div className="mm-seller-photo-audit" role="status">
          <div>
            <strong>{language === "en" ? "Actual product photo audit" :
              language === "ru" ? "Проверка фотографий товаров" : "Mahsulotlarning asl rasmlari"}</strong>
            <p>{language === "en" ? `${missingPhotos.length} of ${activeSellerProducts.length} active items need an image reference.` :
              language === "ru" ? `Для ${missingPhotos.length} из ${activeSellerProducts.length} товаров требуется изображение.` :
              `${activeSellerProducts.length} ta faol mahsulotdan ${missingPhotos.length} tasi uchun rasm kerak.`}</p>
            <p className="mm-photo-audit-details">{language === "en" ?
              `Uploaded: ${uploadedPhotos.length} · external to verify: ${externalPhotos.length}` :
              language === "ru" ? `Загружено: ${uploadedPhotos.length} · внешние ссылки: ${externalPhotos.length}` :
              `Yuklangan: ${uploadedPhotos.length} · tashqi havola (tekshirilmagan): ${externalPhotos.length}`}</p>
            <small>{language === "en" ? "Automatic sample pictures are not counted as verified photos. Existing URLs still require checking for accuracy and permission." :
              language === "ru" ? "Образцы изображений не считаются проверенными. Ссылки также требуют проверки." :
              "Namunaviy rasmlar haqiqiy mahsulot fotosurati deb hisoblanmaydi. Mavjud havolalarning ham aniqligi va ruxsati tekshirilishi kerak."}</small>
          </div>
          <button type="button" className="mm-seller-missing-toggle"
            aria-pressed={onlyMissingPhotos} onClick={() => setOnlyMissingPhotos(value => !value)}>
            {onlyMissingPhotos ?
              (language === "en" ? "Show all" : language === "ru" ? "Показать все" : "Barchasini ko‘rsatish") :
              (language === "en" ? "Show without photos" : language === "ru" ? "Без фотографий" : "Rasmsizlarni ko‘rsatish")}
          </button>
        </div>
        {products.length === 0 ? <p>Hozircha mahsulotlaringiz yo‘q.</p> :
          visibleSellerProducts.length === 0 ? <p className="mm-photo-audit-complete">
            {language === "en" ? "No products without image references in this list." :
              language === "ru" ? "В этом списке нет товаров без ссылок на изображения." :
              "Bu ro‘yxatda rasm havolasi biriktirilmagan mahsulot yo‘q."}
          </p> : <div className="nm-management-list">
          {visibleSellerProducts.map(p => <div className="nm-manage-item" key={p.id}><ProductPicture product={p}/>
            <div><strong>{p.name}</strong><span>{money(p.price)} · {p.stock} dona · {p.is_active === false ? "Faol emas" : "Faol"}</span>
              {p.is_active !== false && ["missing", "invalid"].includes(photoReferenceStatus(p)) && <small className="mm-photo-needed">
                {language === "en" ? "Actual photo required" : language === "ru" ? "Нужно фото товара" : "Asl mahsulot rasmi kerak"}
              </small>}
              {p.is_active !== false && photoReferenceStatus(p) === "external_unverified" && <small className="mm-photo-verify">
                {language === "en" ? "External image: verify rights and exact packaging" :
                  language === "ru" ? "Внешнее фото: проверьте права и упаковку" :
                  "Tashqi surat: ruxsat va qadoqni tekshiring"}
              </small>}</div>
            <button className="nm-icon-btn" type="button" onClick={() => { setEdit(p); setEditing(true); }} aria-label="Tahrirlash"><Icon name="pencil"/></button>
            <button className="nm-icon-btn danger" type="button" disabled={busy} onClick={() => remove(p)} aria-label="O‘chirish"><Icon name="trash"/></button>
          </div>)}
        </div>}
      </div> :
      <div className="nm-management-list">{orders.length === 0 ? <p>Hozircha buyurtmalar yo‘q.</p> :
        orders.map(order => <SellerOrderRow key={order.item_id} order={order} language={language} busy={busy} onSave={statusUpdate}/>)}</div>}
  </Modal>;
}
export default function AppNext() {
  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem("minimarket_language") || "uz"; }
    catch { return "uz"; }
  });
  const [products, setProducts] = useState(() => {
    const saved = readJSON("minimarket_products_cache", []);
    return Array.isArray(saved) ? saved : [];
  });
  const [loadStatus, setLoadStatus] = useState("loading");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("new");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [favorites, setFavorites] = useState(() => readJSON("minimarket_favorites", []));
  const [cart, setCart] = useState(() => {
    const oldCart = readJSON("minimarket_cart", []);
    return Array.isArray(oldCart)
      ? oldCart.map(item => ({ id: item.id, quantity: Number(item.quantity) || 1, name: item.name, price: item.price, category: item.category, image_url: item.image_url, stock: item.stock }))
      : [];
  });
  const [user, setUser] = useState(() => readJSON("minimarket_user", null));
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem("minimarket_token") || ""; }
    catch { return ""; }
  });
  const [dialog, setDialog] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, type = "success") => setToast({ message, type, id: Date.now() }), []);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4800);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    // Keep the browser's document language aligned with the in-app language selector.
    // Otherwise Chrome may auto-translate an Uzbek document after EN/RU is selected.
    document.documentElement.lang = language;
    document.title = language === "en"
      ? "MiniMarket — Online marketplace"
      : language === "ru"
        ? "MiniMarket — Интернет-магазин"
        : "MiniMarket — Onlayn do‘kon";
    try { localStorage.setItem("minimarket_language", language); } catch {}
  }, [language]);
  useEffect(() => persist("minimarket_cart", cart), [cart]);
  useEffect(() => persist("minimarket_favorites", favorites), [favorites]);
  useEffect(() => {
    try {
      if (token && user) {
        localStorage.setItem("minimarket_token",token);
        persist("minimarket_user",user);
      } else {
        localStorage.removeItem("minimarket_token");
        localStorage.removeItem("minimarket_user");
      }
    } catch {}
  }, [user, token]);
  useEffect(() => {
    if (!token) return undefined;
    let alive = true;
    api("/auth/me", { token }).then(current => { if (alive) setUser(current); })
      .catch(error => {
        if (alive && (error.status === 401 || error.status === 403)) {
          setUser(null); setToken("");
        }
      });
    return () => { alive = false; };
  }, [token]);
  useEffect(() => {
    const controller = new AbortController();
    setLoadStatus("loading");
    setLoadError("");
    const retry = async () => {
      let error;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          return await api("/products", { signal: controller.signal });
        } catch (currentError) {
          if (controller.signal.aborted) throw currentError;
          error = currentError;
          if (currentError.status && currentError.status < 500) break;
          if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 900));
        }
      }
      throw error;
    };
    retry().then(data => {
        if (!Array.isArray(data)) throw new Error("Mahsulotlar ro‘yxati noto‘g‘ri");
        setProducts(data);
        persist("minimarket_products_cache", data);
        try { localStorage.setItem("minimarket_products_cache_time",String(Date.now())); } catch {}
        setLoadStatus("ready");
        setLastUpdated(Date.now());
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setLoadError(error.message);
        setLoadStatus("error");
      });
    return () => controller.abort();
  }, [refreshKey]);
  useEffect(() => { document.body.classList.toggle("nm-lock-scroll", !!dialog); return () => document.body.classList.remove("nm-lock-scroll"); }, [dialog]);
  useEffect(() => setVisibleCount(12), [query, category, sort, minPrice, maxPrice, favoritesOnly, onlyAvailable]);

  const categoryCounts = useMemo(() => getCategoryCounts(products), [products]);
  const categoryEmpty = !!category && (categoryCounts.get(categoryKey(category)) || 0) === 0;
  const showRelated = categoryEmpty && !query.trim() && !minPrice && !maxPrice &&
    !favoritesOnly && !onlyAvailable && loadStatus === "ready";
  const relatedProducts = useMemo(() => showRelated
    ? getRelatedProducts(products, category, 6) : [], [products, category, showRelated]);
  const availableCategories = CATEGORIES.map(([name, emoji]) => ({
    name, emoji, count: categoryCounts.get(categoryKey(name)) || 0
  })).filter(item => item.count > 0 && categoryKey(item.name) !== categoryKey(category))
    .sort((a,b) => b.count - a.count).slice(0,5);

  const searchProducts = useMemo(() => {
    let rows = products.filter(isCatalogProduct);
    const q = query.trim().toLocaleLowerCase();
    if (q) rows = rows.filter(p => (p.name + " " + p.category + " " + (p.description || "")).toLocaleLowerCase().includes(q));
    if (category) rows = rows.filter(p => categoryKey(p.category) === categoryKey(category));
    if (minPrice) rows = rows.filter(p => Number(p.price) >= Number(minPrice));
    if (maxPrice) rows = rows.filter(p => Number(p.price) <= Number(maxPrice));
    if (favoritesOnly) rows = rows.filter(p => favorites.some(id => String(id) === String(p.id)));
    if (onlyAvailable) rows = rows.filter(p => Number(p.stock) > 0);
    if (sort === "asc") rows.sort((a,b) => Number(a.price) - Number(b.price));
    else if (sort === "desc") rows.sort((a,b) => Number(b.price) - Number(a.price));
    else rows.sort((a,b) => Number(b.id) - Number(a.id));
    return rows;
  }, [products, query, category, minPrice, maxPrice, favoritesOnly, favorites, sort, onlyAvailable]);
  const showcased = useMemo(() => products
    .filter(p => isCatalogProduct(p) && Number(p.stock) > 0 && productImage(p))
    .sort((a,b) => Number(b.id)-Number(a.id))
    .slice(0,2), [products]);
  const catalogCount = products.filter(isCatalogProduct).length;
  const count = cart.reduce((sum,p) => sum + p.quantity, 0);
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function goTop() { window.scrollTo({top:0,behavior:reducedMotion() ? "auto":"smooth"}); }
  function goCategories() {
    setDialog("");
    document.getElementById("categories")?.scrollIntoView({behavior:reducedMotion()?"auto":"smooth",block:"start"});
  }
  function goCatalog(nextCategory = "", preserveSearch = false) {
    setFavoritesOnly(false);
    setCategory(categoryKey(nextCategory) === categoryKey("Uy jihozlari") ? "Uy-ro‘zg‘or" : nextCategory);
    if (!preserveSearch) {
      setQuery(""); setMinPrice(""); setMaxPrice(""); setOnlyAvailable(false);
    }
    setSearchFocused(false);
    setDialog("");
    requestAnimationFrame(() => document.getElementById("catalog")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"
    }));
  }
  function toggleFavorite(id) {
    setFavorites(prev => prev.some(x => String(x) === String(id)) ? prev.filter(x => String(x) !== String(id)) : [...prev,id]);
  }
  function addToCart(product, quantity = 1) {
    const stock = Number(product.stock);
    const existing = cart.find(x => String(x.id) === String(product.id));
    const remaining = stock - (existing?.quantity || 0);
    if (!Number.isFinite(stock) || remaining <= 0) {
      notify("Mahsulot miqdori omborda yetarli emas", "error"); return false;
    }
    if (!Number.isSafeInteger(quantity) || quantity < 1) return false;
    const actualQuantity = Math.max(1, Math.min(quantity, remaining));
    setCart(prev => {
      const old = prev.find(x => String(x.id) === String(product.id));
      if (old) return prev.map(x => String(x.id) === String(product.id) ?
        { ...x, quantity: Math.min(stock, x.quantity + actualQuantity), price: product.price } : x);
      return [...prev, { id: product.id, name: product.name, price: product.price,
        quantity: actualQuantity, category: product.category,
        image_url: product.image_url, stock: product.stock }];
    });
    notify(language === "en" ? "Added to cart" : language === "ru" ? "Добавлено в корзину" : "Savatchaga qo‘shildi");
    return true;
  }
  function changeQuantity(id, change) {
    setCart(prev => prev.map(item => {
      if (String(item.id) !== String(id)) return item;
      const live = products.find(p => String(p.id) === String(id));
      const max = Math.max(0, Number(live?.stock ?? item.stock) || 0);
      return { ...item, quantity: Math.min(max, Math.max(0, item.quantity + change)) };
    }).filter(item => item.quantity > 0));
  }
  function openCheckout() {
    if (cart.some(item => {
      const live = products.find(p => String(p.id) === String(item.id));
      return !live || live.is_active === false || Number(live.stock) < item.quantity;
    })) {
      notify(language === "en" ? "Some items are unavailable. Update your cart before checkout." :
        language === "ru" ? "Некоторые товары закончились. Проверьте корзину." :
        "Savatchadagi ayrim mahsulotlar tugagan. Savatchani yangilang.", "error");
      return;
    }
    if (loadStatus !== "ready") {
      notify(language === "en" ? "Please wait for the catalog to update before checkout." :
        language === "ru" ? "Дождитесь обновления каталога перед заказом." :
        "Buyurtma berishdan oldin katalog yangilanishini kuting.", "error");
      return;
    }
    if (!user || !token) { setDialog("auth"); notify(WORD(language, "loginFirst"), "error"); return; }
    if (user.role === "seller") { notify(WORD(language, "loginFirst"), "error"); return; }
    setDialog("checkout");
  }
  function signedIn(nextUser, nextToken) {
    setUser(nextUser); setToken(nextToken); setDialog("");
    notify("✅ Tizimga muvaffaqiyatli kirdingiz");
  }
  function logout() { cachedOrderHistory = null; setUser(null); setToken(""); setDialog(""); notify("Hisobdan chiqdingiz"); }
  function orderPlaced(order) {
    cachedOrderHistory = null;
    setCart([]); setDialog(""); setRefreshKey(x => x + 1);
    notify(WORD(language,"successOrder") + order.id);
  }
  function refreshProducts() { setRefreshKey(x => x + 1); }
  function favoritesClick() { setFavoritesOnly(x => !x); setCategory(""); setQuery(""); setMinPrice(""); setMaxPrice(""); setOnlyAvailable(false); setDialog(""); requestAnimationFrame(() => document.getElementById("catalog")?.scrollIntoView({behavior:reducedMotion()?"auto":"smooth",block:"start"})); }
  const searchSuggestions = query.trim() ? searchProducts.slice(0, 5) : [];

  return <div className="nm-app" translate="no" lang={language}>
    <div className="nm-topline"><div className="nm-wrap"><span><Icon name="shield" size={15}/> {WORD(language,"realPrices")}</span><span><Icon name="truck" size={16}/> {WORD(language,"delivery")}</span></div></div>
    <header className="nm-header">
      <div className="nm-wrap nm-header-main">
        <button className="nm-logo" type="button" onClick={goTop}>
          <span className="nm-logo-mark"><Icon name="bag" size={23}/></span>
          <span>Mini<span>Market</span><small>ONLINE STORE</small></span>
        </button>
        <div className="nm-search mm-live-search" onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setSearchFocused(false);
        }}>
          <Icon name="search" size={21}/>
          <input value={query} onFocus={() => setSearchFocused(true)} onChange={event => { setQuery(event.target.value); setSearchFocused(true); }}
            placeholder={WORD(language, "search")} aria-label={WORD(language,"search")}
            autoComplete="off"
            onKeyDown={event => {
              if (event.key === "Escape") setSearchFocused(false);
              if (event.key === "Enter") { setSearchFocused(false); goCatalog("", true); }
            }}/>
          {query && <button className="nm-search-clear" type="button" onClick={() => { setQuery(""); setSearchFocused(false); }} aria-label="Tozalash"><Icon name="x" size={17}/></button>}
          <button type="button" className="nm-search-btn" onClick={() => { setSearchFocused(false); goCatalog("", true); }} aria-label="Qidirish"><Icon name="search" size={19}/></button>
          {searchFocused && query.trim() && <div className="mm-search-suggestions" role="region" aria-label="Qidiruv natijalari">
            <div className="mm-suggestion-label">{WORD(language, "search")}</div>
            {searchSuggestions.length ? searchSuggestions.map(item => <button type="button" className="mm-search-suggestion"
              key={item.id} onClick={() => { setSearchFocused(false); setSelectedProduct(item); setDialog("product"); }}>
              <span className="mm-search-suggestion-art"><ProductPicture product={item}/></span>
              <span className="mm-search-suggestion-name">{item.name}<small>{item.category}</small></span>
              <strong>{money(item.price)}</strong>
            </button>) : <p className="mm-suggestion-empty">{WORD(language, "noResults")}</p>}
            <button type="button" className="mm-suggestion-all" onClick={() => { setSearchFocused(false); goCatalog("", true); }}>
              {WORD(language, "browse")} <Icon name="arrow" size={16}/>
            </button>
          </div>}
        </div>
        <div className="nm-header-actions">
          <select className="nm-lang" aria-label={WORD(language,"changeLang")} value={language} onChange={event => setLanguage(event.target.value)}>
            <option value="uz">UZ</option><option value="ru">RU</option><option value="en">EN</option>
          </select>
          <button className={"nm-header-icon " + (favoritesOnly ? "selected" : "")} type="button" onClick={favoritesClick}
            aria-label={WORD(language, "favorites")}><Icon name="heart"/><span className="nm-small-counter">{favorites.length}</span></button>
          <button className="nm-header-icon" type="button" onClick={() => setDialog("cart")}
            aria-label={WORD(language, "cart")}><Icon name="bag"/><span className="nm-small-counter">{count}</span></button>
          {user ? <div className="nm-user-group">
            <button type="button" className="nm-account-trigger" onClick={() => setDialog(user.role === "seller" || user.role === "admin" ? "seller" : "account")}>
              <span className="nm-mini-avatar">{user.name?.charAt(0)?.toUpperCase() || "M"}</span>
              <span>{user.name?.split(" ")[0] || WORD(language,"account")}</span>
            </button><button className="nm-logout" type="button" onClick={logout} aria-label={WORD(language,"logout")}><Icon name="logout" size={19}/></button>
          </div> :
          <button type="button" className="nm-signin" onClick={() => setDialog("auth")}><Icon name="user" size={19}/>{WORD(language,"signin")}</button>}
        </div>
      </div>
      <div className="nm-navline"><div className="nm-wrap">
        <button type="button" onClick={() => goCatalog("")} className="nm-all-nav"><Icon name="menu" size={18}/>{WORD(language,"catalog")}</button>
        <button type="button" onClick={goCategories}>{WORD(language,"categories")}</button>
        <button type="button" onClick={() => goCatalog("")}>{WORD(language,"shop")}</button>
        <span className="nm-nav-caption"><Icon name="spark" size={16}/> {WORD(language,"subtitle")}</span>
      </div></div>
    </header>

    <main>
      <section className="mm-home-hero nm-wrap nm-hero-layout" aria-label={WORD(language, "heroTitle")}>
        <div className="mm-hero-stage mm-v3-hero">
          <div className="mm-hero-copy">
            <span className="mm-kicker"><Icon name="spark" size={16}/> MINIMARKET · ONLINE MARKETPLACE</span>
            <h1>{language === "ru" ? <>Покупки, которые <em>радуют каждый день.</em></> : language === "en" ? <>Everyday shopping, <em>made better.</em></> : <>Har kuningiz uchun <em>qulay xaridlar.</em></>}</h1>
            <p>{WORD(language,"heroText")}</p>
            <div className="mm-hero-actions">
              <button type="button" className="mm-button-dark" onClick={() => goCatalog("")}>{WORD(language,"explore")} <Icon name="arrow" size={19}/></button>
              <button type="button" className="mm-link-arrow" onClick={goCategories}>{WORD(language,"categories")} <Icon name="chevron" size={18}/></button>
            </div>
            <div className="mm-hero-footnote">
              <span><Icon name="shield" size={16}/>{WORD(language,"notice")}</span>
              <span><Icon name="bag" size={16}/>{catalogCount} {WORD(language,"found")}</span>
            </div>
          </div>
          <div className="mm-v3-stage-visual">
            <div className="mm-v3-orbit" aria-hidden="true"/>
            <div className="mm-v3-stage-topline"><Icon name="spark" size={15}/>{language === "ru" ? "Найдите своё" : language === "en" ? "Discover something great" : "O‘zingizga keraklisini toping"}</div>
            <div className="mm-v3-showcase">
              {showcased.map((item,i) => <button type="button" key={item.id} className={"mm-v3-feature-card mm-v3-feature-"+i}
                onClick={() => {setSelectedProduct(item);setDialog("product");}}>
                <span className="mm-v3-feature-picture"><ProductPicture product={item} eager/></span>
                <span className="mm-v3-feature-details"><small>{item.category}</small><strong>{item.name}</strong><b>{money(item.price)}</b></span>
                <span className="mm-v3-feature-link"><Icon name="arrow" size={16}/></span>
              </button>)}
              {!showcased.length && <div className="mm-v3-showcase-empty"><Icon name="bag" size={66}/><strong>MiniMarket</strong><span>{WORD(language,"productsText")}</span></div>}
            </div>
            <div className="mm-v3-stage-bottom"><span><Icon name="check" size={15}/> {language === "ru" ? "Выбирайте с удобством" : language === "en" ? "Easy browsing" : "Qulay tanlov"}</span>
              <button type="button" onClick={() => goCatalog("")} aria-label={WORD(language,"browse")}><Icon name="arrow" size={21}/></button></div>
          </div>
        </div>
        <div className="mm-value-bar" aria-label="Marketplace information">
          <div className="mm-value-cell"><span className="mm-value-icon"><Icon name="search" size={22}/></span><div><strong>{language === "en" ? "Search with ease" : language === "ru" ? "Удобный поиск" : "Qulay qidiruv"}</strong><small>{WORD(language,"productsText")}</small></div></div>
          <div className="mm-value-cell"><span className="mm-value-icon"><Icon name="shield" size={22}/></span><div><strong>{language === "en" ? "Clear pricing" : language === "ru" ? "Понятные цены" : "Shaffof narxlar"}</strong><small>{WORD(language,"notice")}</small></div></div>
          <div className="mm-value-cell"><span className="mm-value-icon"><Icon name="bag" size={22}/></span><div><strong>{language === "en" ? "Easy ordering" : language === "ru" ? "Лёгкий заказ" : "Oson buyurtma"}</strong><small>{WORD(language,"payment")}</small></div></div>
        </div>
      </section>

      <section className="nm-wrap nm-section nm-category-section" id="categories">
        <div className="nm-section-heading">
          <div><span className="nm-eyebrow">{WORD(language,"categories")}</span><h2>{WORD(language,"categoriesTitle")}</h2></div>
          <button className="nm-text-link" type="button" onClick={() => goCatalog("")}>{WORD(language,"catalog")} <Icon name="arrow" size={18}/></button>
        </div>
        <div className="nm-categories-grid mm-categories-grid">{CATEGORIES.map(([name],index) => {
          const iconNames = ["bottle","utensils","gift","spark","droplet","heart","home","laptop","shirt","star","bag"];
          const amount = categoryCounts.get(categoryKey(name)) || 0;
          const empty = loadStatus === "ready" && amount === 0;
          return <button key={name}
            className={"nm-category-tile mm-category-tile mm-cat-" + (index % 6) + (empty ? " mm-category-empty" : "")}
            type="button" onClick={() => goCatalog(name)} aria-label={name}>
            <span className="mm-category-number">{String(index+1).padStart(2,"0")}</span>
            <span className="mm-category-media"><Icon name={iconNames[index]} size={39} strokeWidth={1.45}/></span>
            <span className="mm-category-title">{name}</span>
            <span className="mm-category-availability">{loadStatus === "ready"
              ? (amount ? amount + " " + WORD(language,"found") :
                (language === "en" ? "Coming soon" : language === "ru" ? "Скоро" : "Hozircha bo‘sh")) : ""}</span>
            <span className="mm-category-arrow"><Icon name="arrow" size={17}/></span>
          </button>;
        })}</div>
      </section>

      <section className="nm-wrap nm-section nm-products-section" id="catalog">
        <div className="nm-section-heading">
          <div><span className="nm-eyebrow">{favoritesOnly ? "♡ " + WORD(language,"favorites") : WORD(language,"shop")}</span>
            <h2>{favoritesOnly ? WORD(language,"favorites") : WORD(language,"ourProducts")}</h2>
            <p>{WORD(language,"productsText")}</p></div>
          <button className="nm-refresh" type="button" onClick={refreshProducts} disabled={loadStatus === "loading"} title={WORD(language,"updated")}>
            <Icon name="refresh" size={18}/><span>{WORD(language,"retry")}</span>
          </button>
        </div>
        <div className="nm-filter-bar">
          <div className="nm-filter-title"><Icon name="filter" size={20}/>{WORD(language,"filter")}</div>
          <select aria-label={WORD(language,"categories")} value={category} onChange={event => {setCategory(event.target.value);setFavoritesOnly(false);}}>
            <option value="">{WORD(language,"all")}</option>
            {CATEGORIES.map(([name]) => <option value={name} key={name}>{name}</option>)}
          </select>
          <input type="number" min="0" placeholder={WORD(language,"min")} value={minPrice} onChange={event => setMinPrice(event.target.value)} aria-label={WORD(language,"min")}/>
          <input type="number" min="0" placeholder={WORD(language,"max")} value={maxPrice} onChange={event => setMaxPrice(event.target.value)} aria-label={WORD(language,"max")}/>
          <select aria-label={WORD(language,"sort")} value={sort} onChange={event => setSort(event.target.value)}>
            <option value="new">{WORD(language,"newest")}</option>
            <option value="asc">{WORD(language,"low")}</option>
            <option value="desc">{WORD(language,"high")}</option>
          </select>
          {(category || query || minPrice || maxPrice || favoritesOnly) && <button className="nm-reset-btn" type="button" onClick={() => {setCategory("");setQuery("");setMinPrice("");setMaxPrice("");setFavoritesOnly(false);}}>{WORD(language,"clear")}</button>}
        </div>
        <div className="mm-stock-filter">
          <label><input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)}/>
            <span>{language === "en" ? "In-stock products only" :
              language === "ru" ? "Только в наличии" : "Faqat mavjud mahsulotlar"}</span>
          </label>
          <span>{language === "en" ? "Shop with confidence" : language === "ru" ? "Удобные покупки" : "O‘zingizga qulay mahsulotni tanlang"}</span>
        </div>
        <div className="nm-catalog-meta">
          {loadStatus === "loading" && searchProducts.length === 0 ?
            <p role="status">{language === "en" ? "Loading products…" : language === "ru" ? "Загрузка товаров…" : "Mahsulotlar yuklanmoqda…"}</p> :
            <p><strong>{searchProducts.length}</strong> {WORD(language,"found")}</p>}
          {loadStatus === "loading" && <span><Icon name="refresh" size={15}/> {WORD(language,"updated")}</span>}
          {loadStatus === "ready" && lastUpdated && <span className="mm-updated"><Icon name="check" size={14}/>
            {language === "en" ? "Catalog updated" : language === "ru" ? "Каталог обновлён" : "Katalog yangilandi"}
          </span>}
        </div>
        {loadStatus === "error" && products.length > 0 && <div className="nm-alert" role="alert">
          <Icon name="refresh" size={19}/><span>{products.length ? WORD(language,"offline") : loadError}</span>
          <button type="button" onClick={refreshProducts}>{WORD(language,"retry")}</button>
        </div>}
        {loadStatus === "loading" && searchProducts.length === 0 ? <div className="mm-catalog-loading" role="status" aria-label={language === "en" ? "Loading products" : language === "ru" ? "Загрузка товаров" : "Mahsulotlar yuklanmoqda"}>
          <div className="mm-catalog-loading-note">
            <Icon name="refresh" size={20}/>
            <div><strong>{language === "en" ? "Updating the catalog" : language === "ru" ? "Обновляем каталог" : "Katalog yangilanmoqda"}</strong>
            <p>{language === "en" ? "We are checking available products. Results will appear when the server responds." :
              language === "ru" ? "Проверяем наличие товаров. Результаты появятся после ответа сервера." :
              "Serverdan mahsulotlar tekshirilmoqda. Javob kelgach natijalar ko‘rsatiladi."}</p></div>
          </div>
          <div className="nm-grid">
            {Array.from({ length:4 },(_,i) => <div key={i} className="nm-skeleton"><div/><span/><span/><span/></div>)}
          </div>
        </div> : loadStatus === "error" && !products.length ? <div className="mm-catalog-failed" role="alert">
          <Icon name="refresh" size={30}/>
          <h3>{language === "en" ? "Could not load products" : language === "ru" ? "Не удалось загрузить товары" : "Mahsulotlar yuklanmadi"}</h3>
          <p>{language === "en" ? "Check your connection and try again." : language === "ru" ? "Проверьте подключение и повторите попытку." : "Internet aloqasini tekshiring va yana bir bor urinib ko‘ring."}</p>
          <button type="button" className="nm-primary" onClick={refreshProducts}>{WORD(language,"retry")}</button>
        </div> : searchProducts.length === 0 && showRelated ? <div className="mm-empty-category" data-testid="empty-category">
          <div className="mm-empty-category-intro">
            <span className="mm-empty-category-symbol" aria-hidden="true">{CATEGORIES.find(([name]) => categoryKey(name) === categoryKey(category))?.[1] || "🛍️"}</span>
            <div className="mm-empty-category-copy">
              <span className="mm-empty-category-kicker">{language === "en" ? "No listings yet" :
                language === "ru" ? "Товаров пока нет" : "Hozircha mahsulot yo‘q"}</span>
              <h3>{language === "en" ? `No products in “${category}” yet` :
                language === "ru" ? `В категории «${category}» пока нет товаров` :
                `“${category}” bo‘limida hozircha mahsulot yo‘q`}</h3>
              <p>{language === "en" ? "Choose a category that already has real products or browse the full catalog." :
                language === "ru" ? "Выберите раздел с товарами или откройте весь каталог." :
                "Mahsulotlari bor boshqa bo‘limni tanlang yoki barcha mahsulotlarni ko‘ring."}</p>
              <button type="button" className="nm-primary" onClick={() => goCatalog("")}>
                {WORD(language,"catalog")} <Icon name="arrow" size={17}/>
              </button>
            </div>
          </div>
          {availableCategories.length > 0 && <div className="mm-empty-category-alternatives">
            <h4>{language === "en" ? "Browse available categories" :
              language === "ru" ? "Разделы с товарами" : "Mahsulotlari bor bo‘limlar"}</h4>
            <div className="mm-empty-category-links">
              {availableCategories.map(item => <button key={item.name} type="button"
                onClick={() => goCatalog(item.name)}>
                <span aria-hidden="true">{item.emoji}</span>
                <strong>{item.name}</strong>
                <small>{item.count} {WORD(language,"found")}</small>
                <Icon name="arrow" size={16}/>
              </button>)}
            </div>
          </div>}
          {relatedProducts.length > 0 && <>
            <h4 className="mm-related-heading">{language === "en" ? "Products from other categories" :
              language === "ru" ? "Товары из других разделов" :
              "Boshqa bo‘limlardagi mahsulotlar"}</h4>
            <div className="nm-grid mm-related-grid">
              {relatedProducts.map((product,index) => <ProductCard key={product.id} product={product}
                eager={index < 2} language={language} onAdd={addToCart}
                favorite={favorites.some(id => String(id) === String(product.id))}
                onFavorite={toggleFavorite}
                onOpen={p => {setSelectedProduct(p);setDialog("product");}}/>)}
            </div>
          </>}
        </div> : searchProducts.length === 0 ? <div className="nm-no-results">
          <div>🔎</div><h3>{WORD(language,"noResults")}</h3><p>{WORD(language,"noResultsText")}</p>
          <button type="button" className="nm-primary" onClick={() => { setCategory("");setQuery("");setMinPrice("");setMaxPrice("");setFavoritesOnly(false);setOnlyAvailable(false); }}>{WORD(language,"clear")}</button>
        </div> :
        <>
          <div className="nm-grid">{searchProducts.slice(0,visibleCount).map((product,index) => <ProductCard key={product.id} product={product} eager={index < 4} language={language}
            onAdd={addToCart} favorite={favorites.some(id => String(id) === String(product.id))}
            onFavorite={toggleFavorite} onOpen={p => {setSelectedProduct(p);setDialog("product");}}/>)}</div>
          {visibleCount < searchProducts.length && <div className="nm-more">
            <button type="button" className="nm-more-btn" onClick={() => setVisibleCount(n => n + 12)}>
              {WORD(language,"showMore")} <Icon name="arrow" size={19}/>
            </button></div>}
        </>}
      </section>
      <section className="nm-wrap nm-bottom-banner">
        <div className="nm-bottom-symbol"><Icon name="bag" size={32}/></div>
        <div><h2>{WORD(language,"about")}</h2><p>{WORD(language,"foot")}</p></div>
        <button type="button" onClick={() => goCatalog("")}>{WORD(language,"browse")} <Icon name="arrow" size={19}/></button>
      </section>
    </main>
    <footer className="nm-footer"><div className="nm-wrap"><strong><Icon name="bag" size={22}/> MiniMarket</strong><span>© 2026 MiniMarket. {WORD(language,"foot")}</span><span>market-mj.uz</span></div></footer>
    <nav className="nm-mobile-tabs" aria-label="Mobile navigation">
      <button type="button" onClick={goTop}><Icon name="home"/><span>{WORD(language,"shop")}</span></button>
      <button type="button" onClick={() => goCatalog("")}><Icon name="search"/><span>{WORD(language,"catalog")}</span></button>
      <button type="button" onClick={favoritesClick}><Icon name="heart"/><span>{WORD(language,"favorites")}</span></button>
      <button type="button" onClick={() => setDialog("cart")}><Icon name="bag"/><span>{WORD(language,"cart")}{count ? " (" + count + ")" : ""}</span></button>
      <button type="button" onClick={() => setDialog(user ? (user.role === "buyer" ? "account" : "seller") : "auth")}><Icon name="user"/><span>{WORD(language,"account")}</span></button>
    </nav>
    {toast && <div className={"nm-toast " + (toast.type === "error" ? "nm-toast-error" : "")} role="status">
      <span>{toast.message}</span><button type="button" onClick={() => setToast(null)} aria-label="Yopish"><Icon name="x" size={16}/></button>
    </div>}
    {dialog === "auth" && <AuthPanel language={language} onClose={() => setDialog("")} onSuccess={signedIn} notify={notify}/>}
    {dialog === "cart" && <CartPanel language={language} cart={cart} products={products} onClose={() => setDialog("")}
      onBrowse={() => goCatalog("")} onQty={changeQuantity} onRemove={id => setCart(prev => prev.filter(item => String(item.id) !== String(id)))}
      onCheckout={openCheckout}/>}
    {dialog === "checkout" && <CheckoutPanel language={language} user={{ ...user, token }} cart={cart} onClose={() => setDialog("")}
      onSuccess={orderPlaced} notify={notify}/>}
    {dialog === "product" && selectedProduct && <ProductPanel key={selectedProduct.id} product={selectedProduct} language={language}
      onClose={() => setDialog("")} onAdd={addToCart} favorite={favorites.some(id => String(id) === String(selectedProduct.id))}
      onFavorite={toggleFavorite}/>}
    {dialog === "account" && user && <AccountPanel user={{ ...user, token }} language={language}
      onClose={() => setDialog("")} notify={notify} onLinkGoogle={() => setDialog("google-link")}/>}
    {dialog === "google-link" && user && <LinkGooglePanel user={{ ...user, token }} language={language}
      onClose={() => setDialog("")} notify={notify}/>}

    {dialog === "seller" && user && <SellerPanel user={{ ...user, token }} language={language}
      onClose={() => setDialog("")} notify={notify} onProductsChanged={refreshProducts} onLinkGoogle={() => setDialog("google-link")}/>}
  </div>;
}
