import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./AppNext.css";

const GOOGLE_CLIENT_ID = "957838455109-tsmj5fstgcncsjj19qo29sfkoe9i3kfa.apps.googleusercontent.com";
const CATEGORIES = [
  ["Ichimliklar", "🥤"], ["Oziq-ovqat mahsulotlari", "🥐"],
  ["Shirinliklar", "🍫"], ["Maishiy kimyo", "🫧"],
  ["Gigiyena vositalari", "🧴"], ["Bolalar uchun", "🧸"],
  ["Uy-ro‘zg‘or", "🏡"], ["Elektronika", "🎧"],
  ["Kiyim-kechak", "👟"], ["Uy jihozlari", "🛋️"],
  ["Sport", "⚽"], ["Boshqalar", "🛍️"]
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
function readJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function persist(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private browsing */ }
}
async function api(path, { method = "GET", data, token, signal } = {}) {
  const controller = new AbortController();
  let abortHandler;
  if (signal) {
    if (signal.aborted) controller.abort();
    else {
      abortHandler = () => controller.abort();
      signal.addEventListener("abort", abortHandler, { once: true });
    }
  }
  const timeout = setTimeout(() => controller.abort(), 75000);
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
    if (!response.ok) throw new Error(body.error || "HTTP " + response.status);
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
function productImage(product) {
  const actual = String(product?.image_url || product?.image || "").trim();
  if (/^https?:\/\//i.test(actual) || actual.startsWith("/")) return actual;
  const name = String(product?.name || "").toLowerCase();
  const mappings = [
    [/nivea/, "/nivea.webp"], [/fairy/, "/fairy.jpg"],
    [/grechka|гречк/, "/grechka.jpg"], [/persil/, "/persil.jpg"],
    [/hydrolife/, "/hydrolife.png"], [/plastilin|пластилин/, "/plastilin.png"],
    [/dezodorant|deodorant/, "/dezodorant.jpg"], [/sovun|совун/, "/sovun.jpg"],
    [/hdmi/, "/hdmi.jpg"], [/bluetooth|karnay/, "/images/bluetooth-karnay.jpg"],
    [/fanta/, "/images/fanta.png"], [/fuse.?tea/, "/images/fuse-tea.png"],
    [/sprite/, "/images/sprite.png"], [/coca.?cola/, "/images/coca-cola.png"],
    [/pepsi/, "/images/pepsi.png"], [/nestle/, "/images/nestle.png"],
    [/lipton/, "/images/lipton.png"], [/choco.?pie/, "/chocopie.jpg"],
    [/koptok|futbol to/, "/koptok.jpg"]
  ];
  const match = mappings.find(([pattern]) => pattern.test(name));
  return match ? match[1] : null;
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
    star: <path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-4.9 7-1L12 2Z"/>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths[name] || paths.spark}
  </svg>;
}
function ProductPicture({ product, className = "" }) {
  const url = productImage(product);
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [url]);
  if (!url || broken) {
    return <div className={"nm-art " + className} aria-label={product.name}>
      <span aria-hidden="true">{CATEGORY_PICTURES[product.category] || "🛍️"}</span>
      <small>MiniMarket</small>
    </div>;
  }
  return <div className={"nm-product-image " + className}>
    <img loading="lazy" decoding="async" src={url} alt={product.name}
      onError={() => setBroken(true)} />
  </div>;
}
function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const handler = event => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return <div className="nm-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={"nm-dialog " + (wide ? "nm-dialog-wide" : "")}
      role="dialog" aria-modal="true" aria-label={title}>
      <div className="nm-dialog-heading">
        <h2>{title}</h2><button type="button" className="nm-icon-btn" aria-label="Yopish" onClick={onClose}><Icon name="x"/></button>
      </div>
      {children}
    </section>
  </div>;
}
function ProductCard({ product, language, onAdd, onFavorite, favorite, onOpen }) {
  const out = Number(product.stock) <= 0;
  const old = Number(product.old_price);
  const price = Number(product.price);
  const discount = old > price ? Math.round((1 - price / old) * 100) : 0;
  const recent = product.created_at && Date.now() - new Date(product.created_at).getTime() < 14 * 86400000;
  return <article className="nm-card">
    <div className="nm-card-photo" onClick={() => onOpen(product)} role="button" tabIndex={0}
      onKeyDown={event => { if (event.key === "Enter") onOpen(product); }} aria-label={product.name}>
      <ProductPicture product={product}/>
      <div className="nm-card-badges">
        {discount > 0 && <span className="nm-sale-tag">-{discount}%</span>}
        {recent && <span className="nm-new-tag">NEW</span>}
      </div>
      <button type="button" className={"nm-love " + (favorite ? "active" : "")}
        onClick={event => { event.stopPropagation(); onFavorite(product.id); }}
        aria-label={favorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo‘shish"} aria-pressed={favorite}>
        <Icon name="heart" size={19}/>
      </button>
    </div>
    <div className="nm-card-body">
      <p className="nm-card-category">{product.category}</p>
      <button type="button" className="nm-card-title" onClick={() => onOpen(product)}>{product.name}</button>
      <p className="nm-card-seller">{product.seller_name ? "Sotuvchi: " + product.seller_name : "MiniMarket"}</p>
      <div className="nm-card-prices">
        <strong>{money(price)}</strong>
        {discount > 0 && <s>{money(old)}</s>}
      </div>
      <div className="nm-card-bottom">
        <span className={out ? "nm-stock nm-out" : "nm-stock"}>
          <i/> {WORD(language, out ? "unavailable" : "available")}
        </span>
        <button type="button" className="nm-add-btn" onClick={() => onAdd(product)}
          disabled={out} aria-label={WORD(language, "add") + ": " + product.name}>
          <Icon name="plus" size={20}/><span>{WORD(language, "add")}</span>
        </button>
      </div>
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
      <p className="nm-form-note">Agar bu email bilan avval parol orqali ro‘yxatdan o‘tgan bo‘lsangiz, o‘sha usulda kiring. Google akkauntini bog‘lash hozircha mavjud emas.</p>
    </>}
  </Modal>;
}
function CartPanel({ language, cart, products, onClose, onQty, onRemove, onCheckout }) {
  const byId = new Map(products.map(p => [String(p.id), p]));
  const total = cart.reduce((sum, item) => {
    const product = byId.get(String(item.id));
    return sum + (Number(product?.price ?? item.price) || 0) * item.quantity;
  }, 0);
  return <div className="nm-drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <aside className="nm-cart-drawer" role="dialog" aria-modal="true" aria-label={WORD(language,"cart")}>
      <div className="nm-drawer-top"><h2><Icon name="bag"/> {WORD(language,"cart")}</h2>
        <button className="nm-icon-btn" type="button" aria-label="Yopish" onClick={onClose}><Icon name="x"/></button>
      </div>
      {cart.length === 0 ? <div className="nm-empty-cart"><span>🛒</span><h3>{WORD(language,"emptyCart")}</h3>
        <button className="nm-primary" type="button" onClick={onClose}>{WORD(language,"browse")}</button></div> :
        <>
          <div className="nm-cart-items">{cart.map(item => {
            const product = byId.get(String(item.id)) || item;
            return <div className="nm-cart-item" key={item.id}>
              <ProductPicture product={product}/>
              <div className="nm-cart-item-main"><strong>{product.name}</strong><span>{money(product.price)}</span>
                <div className="nm-stepper">
                  <button type="button" onClick={() => onQty(item.id, -1)} aria-label="Kamaytirish"><Icon name="minus" size={15}/></button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => onQty(item.id, 1)} aria-label="Ko‘paytirish"><Icon name="plus" size={15}/></button>
                </div>
              </div>
              <button className="nm-remove" type="button" aria-label="O‘chirish" onClick={() => onRemove(item.id)}><Icon name="trash" size={19}/></button>
            </div>;
          })}</div>
          <div className="nm-cart-footer">
            <p className="nm-total"><span>{WORD(language,"total")}</span><strong>{money(total)}</strong></p>
            <small>{WORD(language,"notice")}</small>
            <button className="nm-primary nm-full" type="button" onClick={onCheckout}>{WORD(language,"buy")} <Icon name="arrow" size={18}/></button>
          </div>
        </>}
    </aside>
  </div>;
}
function CheckoutPanel({ language, user, cart, onClose, onSuccess, notify }) {
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
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
    finally { setBusy(false); }
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
  const stock = Math.max(0, Number(product.stock) || 0);
  const canBuy = stock > 0;
  return <Modal title={product.name} onClose={onClose} wide>
    <div className="nm-detail-grid">
      <ProductPicture product={product} className="nm-detail-picture"/>
      <div className="nm-detail-info">
        <span className="nm-eyebrow">{product.category}</span>
        <h2>{product.name}</h2>
        <p>{product.description || "Mahsulot haqida qo‘shimcha ma’lumot kiritilmagan."}</p>
        {product.seller_name && <p className="nm-detail-seller">Sotuvchi: {product.seller_name}</p>}
        <strong className="nm-detail-price">{money(product.price)}</strong>
        <span className={canBuy ? "nm-stock" : "nm-stock nm-out"}><i/>{WORD(language, canBuy ? "available" : "unavailable")} {canBuy ? "· " + stock + " dona" : ""}</span>
        <div className="nm-detail-actions">
          <div className="nm-stepper nm-stepper-large">
            <button type="button" onClick={() => setQuantity(n => Math.max(1,n - 1))}><Icon name="minus"/></button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity(n => Math.min(stock, n + 1))} disabled={!canBuy}><Icon name="plus"/></button>
          </div>
          <button className="nm-primary" type="button" disabled={!canBuy}
            onClick={() => { onAdd(product, quantity); onClose(); }}><Icon name="bag" size={19}/>{WORD(language, "add")}</button>
          <button type="button" className={"nm-icon-btn nm-detail-love " + (favorite ? "active" : "")} onClick={() => onFavorite(product.id)} aria-label="Sevimli"><Icon name="heart"/></button>
        </div>
      </div>
    </div>
  </Modal>;
}
function AccountPanel({ user, language, onClose, notify }) {
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    let alive = true;
    api("/orders/mine", { token: user.token }).then(data => { if (alive) setOrders(Array.isArray(data) ? data : []); })
      .catch(error => { if (alive) notify(error.message, "error"); })
      .finally(() => { if (alive) setBusy(false); });
    return () => { alive = false; };
  }, [user.token]);
  return <Modal title={WORD(language,"yourOrders")} onClose={onClose} wide>
    <div className="nm-account-head"><div className="nm-avatar">{user.name?.charAt(0)?.toUpperCase() || "M"}</div>
      <div><strong>{user.name}</strong><span>{user.email}</span></div></div>
    {busy ? <p className="nm-inline-wait">⏳ {WORD(language,"loading")}</p> :
      orders.length === 0 ? <div className="nm-no-orders"><Icon name="package" size={38}/><p>Hozircha buyurtmalaringiz yo‘q.</p></div> :
      <div className="nm-order-list">{orders.map(order => <article className="nm-order" key={order.id}>
        <div className="nm-order-head"><strong>Buyurtma #{order.id}</strong><span>{order.status || "Yangi"}</span></div>
        <p>{money(order.total_amount)} · {new Date(order.created_at).toLocaleDateString("uz-UZ")}</p>
        <div>{order.items?.map(item => <p key={item.id} className="nm-order-item">{item.product_name} × {item.quantity} <span>{item.status || "Yangi"}</span></p>)}</div>
      </article>)}</div>}
  </Modal>;
}
function SellerPanel({ user, language, onClose, notify, onProductsChanged }) {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [edit, setEdit] = useState(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
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
      await api(edit ? "/products/" + edit.id : "/products", {
        method: edit ? "PUT" : "POST", token: user.token, data: payload
      });
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
  async function statusUpdate(order, status) {
    setBusy(true);
    try {
      await api("/seller/orders/" + order.item_id, { method: "PATCH", token: user.token, data: { status } });
      setReload(n => n + 1); notify("Buyurtma holati yangilandi");
    } catch (error) { notify(error.message, "error"); }
    finally { setBusy(false); }
  }
  return <Modal title={WORD(language,"seller")} onClose={onClose} wide>
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
        <label>{WORD(language,"image")}<input name="image_url" type="url" placeholder="https://..." defaultValue={edit?.image_url || ""}/></label>
        <button className="nm-primary nm-full" type="submit" disabled={busy}>{busy ? "⏳" : WORD(language,"save")}</button>
      </form> :
      <div className="nm-seller-content">
        <button className="nm-primary nm-add-product" type="button" onClick={() => { setEdit(null); setEditing(true); }}><Icon name="plus"/>{WORD(language,"newProduct")}</button>
        {products.length === 0 ? <p>Hozircha mahsulotlaringiz yo‘q.</p> : <div className="nm-management-list">
          {products.map(p => <div className="nm-manage-item" key={p.id}><ProductPicture product={p}/>
            <div><strong>{p.name}</strong><span>{money(p.price)} · {p.stock} dona · {p.is_active === false ? "Faol emas" : "Faol"}</span></div>
            <button className="nm-icon-btn" type="button" onClick={() => { setEdit(p); setEditing(true); }} aria-label="Tahrirlash"><Icon name="pencil"/></button>
            <button className="nm-icon-btn danger" type="button" disabled={busy} onClick={() => remove(p)} aria-label="O‘chirish"><Icon name="trash"/></button>
          </div>)}
        </div>}
      </div> :
      <div className="nm-management-list">{orders.length === 0 ? <p>Hozircha buyurtmalar yo‘q.</p> :
        orders.map(order => <div className="nm-seller-order" key={order.item_id}>
          <div><strong>#{order.order_id} · {order.product_name}</strong><p>{order.customer_name} · {order.phone}</p>
            <small>{order.address}</small><p>{order.quantity} dona · {money(order.unit_price)}</p></div>
          <label>Holati<select value={order.status || "Yangi"} disabled={busy} onChange={e => statusUpdate(order,e.target.value)}>
            <option>Yangi</option><option>Jarayonda</option><option>Yetkazilgan</option>
          </select></label>
        </div>)}</div>}
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
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("new");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, type = "success") => setToast({ message, type, id: Date.now() }), []);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4800);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => { try { localStorage.setItem("minimarket_language",language); } catch {} }, [language]);
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
      .catch(() => { if (alive) { setUser(null); setToken(""); } });
    return () => { alive = false; };
  }, [token]);
  useEffect(() => {
    const controller = new AbortController();
    setLoadStatus("loading");
    setLoadError("");
    api("/products", { signal: controller.signal })
      .then(data => {
        if (!Array.isArray(data)) throw new Error("Mahsulotlar ro‘yxati noto‘g‘ri");
        setProducts(data);
        persist("minimarket_products_cache", data);
        try { localStorage.setItem("minimarket_products_cache_time",String(Date.now())); } catch {}
        setLoadStatus("ready");
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setLoadError(error.message);
        setLoadStatus("error");
      });
    return () => controller.abort();
  }, [refreshKey]);
  useEffect(() => {
    const handler = event => { if (event.key === "Escape") setDialog(""); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => { document.body.classList.toggle("nm-lock-scroll", !!dialog); return () => document.body.classList.remove("nm-lock-scroll"); }, [dialog]);
  useEffect(() => setVisibleCount(12), [query, category, sort, minPrice, maxPrice, favoritesOnly]);

  const searchProducts = useMemo(() => {
    let rows = products.filter(p => p.is_active !== false && Number(p.price) > 0);
    const q = query.trim().toLocaleLowerCase();
    if (q) rows = rows.filter(p => (p.name + " " + p.category + " " + (p.description || "")).toLocaleLowerCase().includes(q));
    if (category) rows = rows.filter(p => p.category === category);
    if (minPrice) rows = rows.filter(p => Number(p.price) >= Number(minPrice));
    if (maxPrice) rows = rows.filter(p => Number(p.price) <= Number(maxPrice));
    if (favoritesOnly) rows = rows.filter(p => favorites.some(id => String(id) === String(p.id)));
    if (sort === "asc") rows.sort((a,b) => Number(a.price) - Number(b.price));
    else if (sort === "desc") rows.sort((a,b) => Number(b.price) - Number(a.price));
    else rows.sort((a,b) => Number(b.id) - Number(a.id));
    return rows;
  }, [products, query, category, minPrice, maxPrice, favoritesOnly, favorites, sort]);
  const showcased = useMemo(() => products.filter(p => p.is_active !== false && Number(p.stock) > 0 && Number(p.price) > 0).slice(0,3), [products]);
  const count = cart.reduce((sum,p) => sum + p.quantity, 0);
  function goCatalog(nextCategory = "") {
    setFavoritesOnly(false);
    setCategory(nextCategory);
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
    if (stock <= 0) { notify("Bu mahsulot omborda qolmagan", "error"); return; }
    setCart(prev => {
      const old = prev.find(x => String(x.id) === String(product.id));
      const allowed = Number.isFinite(stock) ? Math.max(0, stock - (old?.quantity || 0)) : quantity;
      const add = Math.max(0, Math.min(quantity, allowed));
      if (add === 0) { notify("Omborda bundan ortiq mahsulot yo‘q", "error"); return prev; }
      if (old) return prev.map(x => String(x.id) === String(product.id) ? { ...x, quantity: x.quantity + add } : x);
      return [...prev,{ id: product.id, name: product.name, price: product.price, quantity: add, category: product.category, image_url: product.image_url, stock: product.stock }];
    });
    notify("Savatchaga qo‘shildi");
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
    if (!user || !token) { setDialog("auth"); notify(WORD(language, "loginFirst"), "error"); return; }
    if (user.role === "seller") { notify(WORD(language, "loginFirst"), "error"); return; }
    setDialog("checkout");
  }
  function signedIn(nextUser, nextToken) {
    setUser(nextUser); setToken(nextToken); setDialog("");
    notify("✅ Tizimga muvaffaqiyatli kirdingiz");
  }
  function logout() { setUser(null); setToken(""); setDialog(""); notify("Hisobdan chiqdingiz"); }
  function orderPlaced(order) {
    setCart([]); setDialog(""); setRefreshKey(x => x + 1);
    notify(WORD(language,"successOrder") + order.id);
  }
  function refreshProducts() { setRefreshKey(x => x + 1); }
  function favoritesClick() { setFavoritesOnly(x => !x); setCategory(""); setDialog(""); requestAnimationFrame(() => document.getElementById("catalog")?.scrollIntoView({behavior:"smooth",block:"start"})); }
  return <div className="nm-app">
    <div className="nm-topline"><div className="nm-wrap"><span><Icon name="shield" size={15}/> {WORD(language,"realPrices")}</span><span><Icon name="truck" size={16}/> {WORD(language,"delivery")}</span></div></div>
    <header className="nm-header">
      <div className="nm-wrap nm-header-main">
        <button className="nm-logo" type="button" onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>
          <span className="nm-logo-mark"><Icon name="bag" size={23}/></span>
          <span>Mini<span>Market</span><small>ONLINE STORE</small></span>
        </button>
        <div className="nm-search">
          <Icon name="search" size={21}/>
          <input value={query} onChange={event => setQuery(event.target.value)}
            placeholder={WORD(language, "search")} aria-label={WORD(language,"search")}
            onKeyDown={event => { if (event.key === "Enter") goCatalog(category); }}/>
          {query && <button className="nm-search-clear" type="button" onClick={() => setQuery("")} aria-label="Tozalash"><Icon name="x" size={17}/></button>}
          <button type="button" className="nm-search-btn" onClick={() => goCatalog(category)} aria-label="Qidirish"><Icon name="search" size={19}/></button>
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
        <button type="button" onClick={() => document.getElementById("categories")?.scrollIntoView({behavior:"smooth"})}>{WORD(language,"categories")}</button>
        <button type="button" onClick={() => goCatalog("")}>{WORD(language,"shop")}</button>
        <span className="nm-nav-caption"><Icon name="spark" size={16}/> {WORD(language,"subtitle")}</span>
      </div></div>
    </header>

    <main>
      <section className="nm-wrap nm-hero-layout">
        <div className="nm-hero">
          <div className="nm-hero-copy">
            <div className="nm-hero-overline"><span className="nm-pulse"/> MINI MARKETPLACE · 2026</div>
            <h1>{WORD(language,"heroTitle")}</h1>
            <p>{WORD(language,"heroText")}</p>
            <div className="nm-hero-buttons">
              <button className="nm-hero-primary" type="button" onClick={() => goCatalog("")}>{WORD(language,"explore")} <Icon name="arrow"/></button>
              <span><Icon name="check" size={18}/> {WORD(language,"realPrices")}</span>
            </div>
          </div>
          <div className="nm-hero-art" aria-hidden="true">
            <div className="nm-hero-orbit"/>
            {showcased.length ? showcased.map((p,i) => <div className={"nm-hero-product nm-hero-product-" + i} key={p.id}>
              <ProductPicture product={p}/><div><span>{p.category}</span><strong>{money(p.price)}</strong></div>
            </div>) : <div className="nm-hero-empty-art"><span>🛍️</span><span>🥤</span><span>🎧</span></div>}
            <div className="nm-floating-label"><Icon name="spark" size={15}/> {WORD(language,"newItems")}</div>
          </div>
        </div>
        <div className="nm-hero-stats">
          <div><span className="nm-stat-icon orange"><Icon name="package"/></span><strong>{products.length > 0 ? products.length + "+" : "MiniMarket"}</strong><small>{WORD(language,"catalog")}</small></div>
          <div><span className="nm-stat-icon mint"><Icon name="shield"/></span><strong>{WORD(language,"realPrices")}</strong><small>{WORD(language,"notice")}</small></div>
          <div><span className="nm-stat-icon lavender"><Icon name="truck"/></span><strong>{WORD(language,"delivery")}</strong><small>{WORD(language,"payment")}</small></div>
        </div>
      </section>

      <section className="nm-wrap nm-section nm-category-section" id="categories">
        <div className="nm-section-heading">
          <div><span className="nm-eyebrow">{WORD(language,"categories")}</span><h2>{WORD(language,"categoriesTitle")}</h2></div>
          <button className="nm-text-link" type="button" onClick={() => goCatalog("")}>{WORD(language,"catalog")} <Icon name="arrow" size={18}/></button>
        </div>
        <div className="nm-categories-grid">{CATEGORIES.map(([name,emoji],index) => (
          <button key={name} className={"nm-category-tile nm-cat-color-" + (index % 6)} type="button" onClick={() => goCatalog(name)}>
            <span className="nm-category-emoji" aria-hidden="true">{emoji}</span>
            <span>{name}</span><Icon name="chevron" size={17}/>
          </button>
        ))}</div>
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
        <div className="nm-catalog-meta">
          <p><strong>{searchProducts.length}</strong> {WORD(language,"found")}</p>
          {loadStatus === "loading" && <span><Icon name="refresh" size={15}/> {WORD(language,"updated")}</span>}
        </div>
        {loadStatus === "error" && <div className="nm-alert" role="alert">
          <Icon name="refresh" size={19}/><span>{products.length ? WORD(language,"offline") : loadError}</span>
          <button type="button" onClick={refreshProducts}>{WORD(language,"retry")}</button>
        </div>}
        {loadStatus === "loading" && !products.length ? <div className="nm-grid">
          {Array.from({ length:8 },(_,i) => <div key={i} className="nm-skeleton"><div/><span/><span/><span/></div>)}
        </div> : searchProducts.length === 0 ? <div className="nm-no-results">
          <div>🔎</div><h3>{WORD(language,"noResults")}</h3><p>{WORD(language,"noResultsText")}</p>
          <button type="button" className="nm-primary" onClick={() => { setCategory("");setQuery("");setMinPrice("");setMaxPrice("");setFavoritesOnly(false); }}>{WORD(language,"clear")}</button>
        </div> :
        <>
          <div className="nm-grid">{searchProducts.slice(0,visibleCount).map(product => <ProductCard key={product.id} product={product} language={language}
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
      <button type="button" onClick={() => window.scrollTo({top:0,behavior:"smooth"})}><Icon name="home"/><span>{WORD(language,"shop")}</span></button>
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
      onQty={changeQuantity} onRemove={id => setCart(prev => prev.filter(item => String(item.id) !== String(id)))}
      onCheckout={openCheckout}/>}
    {dialog === "checkout" && <CheckoutPanel language={language} user={{ ...user, token }} cart={cart} onClose={() => setDialog("")}
      onSuccess={orderPlaced} notify={notify}/>}
    {dialog === "product" && selectedProduct && <ProductPanel key={selectedProduct.id} product={selectedProduct} language={language}
      onClose={() => setDialog("")} onAdd={addToCart} favorite={favorites.some(id => String(id) === String(selectedProduct.id))}
      onFavorite={toggleFavorite}/>}
    {dialog === "account" && user && <AccountPanel user={{ ...user, token }} language={language} onClose={() => setDialog("")} notify={notify}/>}
    {dialog === "seller" && user && <SellerPanel user={{ ...user, token }} language={language}
      onClose={() => setDialog("")} notify={notify} onProductsChanged={refreshProducts}/>}
  </div>;
}
