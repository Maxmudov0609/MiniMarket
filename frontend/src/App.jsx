
import { useState, useEffect } from "react";
import "./App.css";
import { useTranslation } from "react-i18next";

const translations = {
  uz: {
    minPrice: "Minimal narx",
    maxPrice: "Maksimal narx",
    newest: "Eng yangi",
    allCategories: "Barcha kategoriyalar",
    search: "Mahsulot qidirish...",
    login: "Kirish",
    register: "Ro'yxatdan o'tish",
    cart: "Savatcha",
    welcome: "MiniMarketga xush kelibsiz!",
    subtitle: "Eng yaxshi mahsulotlar — qulay narxlarda",
    shop: "Mahsulotlarni ko'rish",
    popular: "Mashhur mahsulotlar"
    
  },

  ru: {
    minPrice: "Минимальная цена",
    maxPrice: "Максимальная цена",
    newest: "Сначала новые",
        allCategories: "Все категории",
    search: "Поиск товаров...",
    login: "Войти",
    register: "Регистрация",
    cart: "Корзина",
    welcome: "Добро пожаловать в MiniMarket!",
    subtitle: "Лучшие товары по доступным ценам",
    shop: "Смотреть товары",
    popular: "Популярные товары"
  },

  en: {
    minPrice: "Minimum price",
    maxPrice: "Maximum price",
    newest: "Newest first",
    allCategories: "All categories",
    search: "Search products...",
    login: "Sign in",
    register: "Sign up",
    cart: "Cart",
    welcome: "Welcome to MiniMarket!",
    subtitle: "The best products at affordable prices",
    shop: "Shop now",
    popular: "Popular products"
  }
};


const products = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    price: 12500000,
    category: "Elektronika",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600"
  },
  {
    id: 2,
    name: "Sport oyoq kiyimi",
    price: 450000,
    category: "Kiyim-kechak",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
  },
  {
    id: 3,
    name: "Quloqchin",
    price: 320000,
    category: "Elektronika",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
  },
  {
    id: 4,
    name: "Qo'l soati",
    price: 650000,
    category: "Boshqalar",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
  }
  
];
const marketCategories = [
  { icon: "🥤", name: "Ichimliklar" },
  { icon: "🍎", name: "Oziq-ovqat mahsulotlari" },
  { icon: "🍬", name: "Shirinliklar" },
  { icon: "🧴", name: "Maishiy kimyo" },
  { icon: "🧻", name: "Gigiyena vositalari" },
  { icon: "🧸", name: "Bolalar uchun" },
  { icon: "🏠", name: "Uy-ro‘zg‘or" },
  { icon: "📱", name: "Elektronika" }
];
const productImages = {
  "Hydrolife suv 1 L": "/images/hydrolife.jpg",
  "Plastilin 12 rang": "/images/plastilin.jpg",
  "Grechka 1 kg": "/images/grechka.jpg",
  "Hydrolife suv 1 L": "/categories/cleaning-products.jpg",
  "Persil 1.5 kg": "/persil.jpg",
  "Kir sovuni 200 g": "/sovun.jpg",
  "HDMI kabel 2 m": "/hdmi.jpg",
  "Choco Pie 6 dona": "/chocopie.jpg",
  "Koptok": "/koptok.jpg",
  "Dezodorant 150 ml": "/dezodorant.jpg",
  "Fairy 450 ml": "/fairy.jpg",
  "Nivea dush geli 250 ml": "/nivea.webp",
  "Bluetooth karnay": "/images/bluetooth-karnay.jpg",
  "Fanta 1.5 L": "/images/fanta.png",
  "Fuse Tea 1 L": "/images/fuse-tea.png",
  "Sprite 1.5 L": "/images/sprite.png",
  "Coca-Cola 1.5 L": "/images/coca-cola.png",
  "Pepsi 1.5 L": "/images/pepsi.png",
  "Nestle suv 1.5 L": "/images/nestle.png",
  "Lipton Ice Tea 1 L": "/images/lipton.png",
};

function App() {
  const { t: translate, i18n } = useTranslation();

  const [showProducts, setShowProducts] = useState(() => {
    return localStorage.getItem("minimarket_showProducts") === "true";
  });
  useEffect(() => {
    localStorage.setItem(
      "minimarket_showProducts",
      String(showProducts)
    );
  }, [showProducts]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("minimarket_favorites")) || [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("minimarket_favorites", JSON.stringify(favorites));
  }, [favorites]);
  const [showFavorites, setShowFavorites] = useState(false);
  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("minimarket_language") || "uz";
  });

  const t = translations[language] || translations.uz;

  useEffect(() => {
    localStorage.setItem("minimarket_language", language);
  }, [language]);

  const [dbProducts, setDbProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteToast, setDeleteToast] = useState(null);

useEffect(() => {
  const controller = new AbortController();

  async function loadProducts() {
    try {
      setProductsLoading(true);

      const response = await fetch(
        "https://minimarket-backend-r4co.onrender.com/api/products",
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error("Mahsulotlarni yuklashda xatolik");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("API noto'g'ri ma'lumot qaytardi");
      }

      if (!controller.signal.aborted) {
        setDbProducts(data);
        console.log("Yuklangan mahsulotlar:", data.length);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Mahsulotlarni yuklash xatosi:", error);
      }
    } finally {
      if (!controller.signal.aborted) {
        setProductsLoading(false);
      }
    }
  }

  loadProducts();

  return () => controller.abort();
}, []);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Barchasi");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("minimarket_cart")) || [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("minimarket_cart", JSON.stringify(cart));
  }, [cart]);
  const [user, setUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("minimarket_user")) || null;
  } catch {
    return null;
  }
});

const [token, setToken] = useState(
  () => localStorage.getItem("minimarket_token") || ""
);
useEffect(() => {
  if (user && token) {
    localStorage.setItem("minimarket_user", JSON.stringify(user));
    localStorage.setItem("minimarket_token", token);
  } else {
    localStorage.removeItem("minimarket_user");
    localStorage.removeItem("minimarket_token");
  }
}, [user, token]);

  const [showLogin, setShowLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showSellerPanel, setShowSellerPanel] = useState(false);
  const [showBuyerPanel, setShowBuyerPanel] = useState(false);
    
  const [sellerOrders, setSellerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);


  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authRole, setAuthRole] = useState("buyer");
    
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  useEffect(() => {
  if (!showLogin || isRegister) return;

  let cancelled = false;
  let timer;

  const initGoogle = () => {
    if (cancelled) return;

    const google = window.google;

    if (!google?.accounts?.id) {
      timer = setTimeout(initGoogle, 300);
      return;
    }

    const button = document.getElementById("google-signin-button");
    if (!button) return;

google.accounts.id.initialize({
  client_id: "957838455109-tsmj5fstgcncsjj19qo29sfkoe9i3kfa.apps.googleusercontent.com",
callback: async (response) => {
  try {
    const res = await fetch("https://minimarket-backend-r4co.onrender.com/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credential: response.credential,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || "Google orqali kirishda xatolik");
    }

    console.log("Google login natijasi:", data);
    alert("Google orqali kirish muvaffaqiyatli!");
  } catch (error) {
    console.error("Google login xatosi:", error);
    alert(error.message);
  }
},
    });

    button.innerHTML = "";

    google.accounts.id.renderButton(button, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      width: 300,
    });
  };

  initGoogle();

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}, [showLogin, isRegister]);


  function addToCart(product) {
  setCart((prevCart) => {
    const existing = prevCart.find(
      (item) => item.id === product.id
    );

    if (existing) {
      return prevCart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [...prevCart, { ...product, quantity: 1 }];
  });
}


  function changeQuantity(id, amount) {
  setCart((prevCart) =>
    prevCart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + amount }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
}

async function loadSellerOrders() {
  if (!token) return;

  setOrdersLoading(true);

  try {
    const response = await fetch(
      "https://minimarket-backend-r4co.onrender.com/api/seller/orders",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Xatolik yuz berdi");
    }

    setSellerOrders(data);
  } catch (error) {
    alert(error.message);
  } finally {
    setOrdersLoading(false);
  }
}
async function updateOrderStatus(itemId, status) {
  if (!token) return;

  try {
    const response = await fetch(
      `https://minimarket-backend-r4co.onrender.com/api/seller/orders/${itemId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Buyurtma holatini o‘zgartirib bo‘lmadi");
    }

    await loadSellerOrders();
    alert("✅ Buyurtma holati yangilandi!");
  } catch (error) {
    alert(error.message);
  }
}


async function handlePlaceOrder(e) {
  e.preventDefault();

  if (!token || user?.role !== "buyer") {
    alert("Buyurtma berish uchun xaridor sifatida kiring!");
    return;
  }

  if (cart.length === 0) {
    alert("Savatcha bo'sh!");
    return;
  }

  const form = e.currentTarget;

  const body = {
    customer_name: form.elements.customer_name.value,
    phone: form.elements.phone.value,
    address: form.elements.address.value,
    note: "",
    items: cart.map((item) => ({
      product_id: Number(item.id),
      quantity: item.quantity,
    })),
  };
  const submitButton = form.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "⏳ Buyurtmangiz yuborilmoqda...";
  }

  try {
    const response = await fetch("https://minimarket-backend-r4co.onrender.com/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Buyurtma berishda xatolik");
    }

    const notification = document.createElement("div");

    notification.textContent = "✅ Buyurtmangiz muvaffaqiyatli qabul qilindi!";

    Object.assign(notification.style, {
      position: "fixed",
      top: "25px",
      right: "25px",
      background: "#16a34a",
      color: "white",
      padding: "18px 25px",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "bold",
      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
      zIndex: "99999"
    });

    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
    setCart([]);
    setShowOrderForm(false);

    const productsResponse = await fetch(
      "https://minimarket-backend-r4co.onrender.com/api/products"
    );

    if (productsResponse.ok) {
      setDbProducts(await productsResponse.json());
    }
} catch (error) {
  alert(error.message);
} finally {
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = "✅ Buyurtmani tasdiqlash";
  }
}
}

  const filteredProducts = dbProducts
    .filter((product) => {
      const matchesSearch = String(product.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const normalizeCategory = (value) =>
        String(value || "")
          .trim()
          .toLowerCase()
          .replace(/[‘’ʻ`']/g, "'");

      const matchesCategory =
        category === "Barchasi" ||
        category === "" ||
        normalizeCategory(product.category) === normalizeCategory(category);

      const matchesMin =
        minPrice === "" || Number(product.price) >= Number(minPrice);

      const matchesMax =
        maxPrice === "" || Number(product.price) <= Number(maxPrice);

      return matchesSearch && matchesCategory && matchesMin && matchesMax;
    })

.sort((a, b) => {
  if (sort === "cheap") return Number(a.price) - Number(b.price);
  if (sort === "expensive") return Number(b.price) - Number(a.price);
  return Number(b.id) - Number(a.id);
});

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isRegister ? "register" : "login";

      const body = {
        email: authEmail,
        password: authPassword,
      };

      if (isRegister) {
        body.name = authName;
        body.role = authRole;
      }

      const response = await fetch(
        `https://minimarket-backend-r4co.onrender.com/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Xatolik yuz berdi");
      }

      setUser(data.user);
      setToken(data.token);
      setShowLogin(false);
      
      console.log("Foydalanuvchi:", data.user);
      console.log("Foydalanuvchi roli:", data.user?.role);

      const notification = document.createElement("div");

notification.textContent = isRegister
  ? "✅ Ro‘yxatdan muvaffaqiyatli o‘tdingiz!"
  : "✅ Tizimga muvaffaqiyatli kirdingiz!";

Object.assign(notification.style, {
  position: "fixed",
  top: "25px",
  right: "25px",
  background: "#16a34a",
  color: "white",
  padding: "18px 25px",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "bold",
  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
  zIndex: "99999"
});

document.body.appendChild(notification);

setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      alert(error.message);
    }
  };
  
const handleAddProduct = async (e) => {
  e.preventDefault();

  const form = e.currentTarget;

  const body = {
    name: form.elements.name.value,
    description: form.elements.name.value + " — sifatli mahsulot",
    price: Number(form.elements.price.value),
    category: form.elements.category.value === "Oziq-ovqat"
  ? "Oziq-ovqat mahsulotlari"
  : form.elements.category.value,
    image_url: form.elements.image_url.value,
    stock: 10,
  };

  try {
    const response = await fetch(
      "https://minimarket-backend-r4co.onrender.com/api/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Xatolik yuz berdi");
    }

    const notification = document.createElement("div");

notification.textContent = "✅ Mahsulot muvaffaqiyatli qo‘shildi!";

Object.assign(notification.style, {
  position: "fixed",
  top: "25px",
  right: "25px",
  background: "#16a34a",
  color: "white",
  padding: "18px 25px",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "bold",
  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
  zIndex: "99999"
});

document.body.appendChild(notification);

setTimeout(() => notification.remove(), 3000);
    const productsResponse = await fetch(
      "https://minimarket-backend-r4co.onrender.com/api/products"
    );

    if (!productsResponse.ok) {
      throw new Error("Mahsulotlar ro'yxatini yangilab bo'lmadi");
    }

    const updatedProducts = await productsResponse.json();

    setDbProducts(updatedProducts);
    form.reset();
  } catch (error) {
    const notification = document.createElement("div");

notification.innerHTML = `
  <div style="font-size:30px; margin-bottom:10px;">⚠️</div>
  <div style="font-size:17px; font-weight:700; margin-bottom:6px;">
    Xatolik yuz berdi
  </div>
  <div style="font-size:14px; opacity:0.85;">
    ${error.message}
  </div>
`;

Object.assign(notification.style, {
  position: "fixed",
  top: "25px",
  right: "25px",
  background: "linear-gradient(135deg, #6d28d9, #9333ea)",
  color: "white",
  padding: "22px 30px",
  borderRadius: "18px",
  boxShadow: "0 15px 40px rgba(109,40,217,0.35)",
  zIndex: "999999",
  fontFamily: "Arial, sans-serif",
  textAlign: "center",
  minWidth: "260px",
  maxWidth: "calc(100vw - 50px)",
  boxSizing: "border-box",
  animation: "fadeIn 0.3s ease"
});

document.body.appendChild(notification);

setTimeout(() => {
  notification.remove();
}, 4000);
  }
};


const handleDeleteProduct = (productId) => {
  setDeleteProductId(productId);
};

const confirmDeleteProduct = async () => {
  const productId = deleteProductId;
  if (productId === null) return;



  try {
    const response = await fetch(
      `https://minimarket-backend-r4co.onrender.com/api/products/${productId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Mahsulotni o'chirishda xatolik");
    }

    setDbProducts((prev) =>
      prev.filter((product) => product.id !== productId)
    );

    setDeleteProductId(null);
setDeleteToast("Mahsulot muvaffaqiyatli o'chirildi! 🎉");
setTimeout(() => setDeleteToast(null), 3500);
  } catch (error) {
    alert(error.message);
  }
};

const handleUpdateProduct = async (e) => {
  e.preventDefault();

  if (!editingProduct) return;

  const form = e.currentTarget;

  const body = {
  name: form.elements.name.value,
  description: editingProduct.description || "",
  price: Number(form.elements.price.value),
  old_price: form.elements.old_price.value
    ? Number(form.elements.old_price.value)
    : null,
  discount_percent: Number(form.elements.discount_percent.value || 0),
  category: form.elements.category.value,
  image_url: form.elements.image_url.value,
  stock: Number(editingProduct.stock ?? 10),
};

  try {
    const response = await fetch(
      `https://minimarket-backend-r4co.onrender.com/api/products/${editingProduct.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Tahrirlashda xatolik");
    }

    setDbProducts((prev) =>
      prev.map((product) =>
        product.id === editingProduct.id
          ? { ...product, ...body }
          : product
      )
    );

    setEditingProduct(null);
    alert("Mahsulot muvaffaqiyatli tahrirlandi!");
  } catch (error) {
    alert(error.message);
  }
};





  return (
    
    <div>

      <header className="navbar">
        <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <img
    src="/minimarket-logo.png"
    alt="MiniMarket logotipi"
    style={{
      width: "42px",
      height: "42px",
      objectFit: "contain",
      borderRadius: "10px"
    }}
  />
  <span>MiniMarket</span>
</h2>
  <input
    type="text"
    placeholder={t.search}
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
          <div className="nav-actions">
          {!user ? (
            <>
              <button
                onClick={() => {
                  setIsRegister(false);
                  setShowLogin(true);
                }}
              >
                {t.login}
              </button>

              <button
                onClick={() => {
                  setIsRegister(true);
                  setShowLogin(true);
                }}
              >
                {t.register}
              </button>
            </>
          ) : (
            <>
              <span>👤 {user.name}</span>
              <button
                type="button"
                onClick={() => {
                  setUser(null);
                  setToken("");
                  setShowSellerPanel(false);
                  setShowCart(false);
                  setShowOrderForm(false);
                }}
              >
                {language === "ru"
  ? "Выйти"
  : language === "en"
  ? "Log out"
  : "Akkauntdan chiqish"}
              </button>

              {user.role === "seller" && (
                <button
                  onClick={() => setShowSellerPanel(true)}
                >
                  {language === "ru"
  ? "Кабинет продавца"
  : language === "en"
  ? "Seller dashboard"
  : "Sotuvchi kabineti"}
                </button>
              )}
              {user.role === "buyer" && (
                <button
                  type="button"
                  onClick={() => setShowBuyerPanel(true)}
                >
                  🛍️ Xaridor kabineti
                </button>
              )}
            </>
          )}
          
<select
  value={language}
  onChange={(e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  }}
  aria-label="Tilni tanlash"
  style={{
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    cursor: "pointer",
  }}
>
  <option value="uz">🇺🇿 UZ</option>
  <option value="ru">🇷🇺 RU</option>
  <option value="en">🇬🇧 EN</option>
</select>
          <button onClick={() => setShowCart(!showCart)}>
            🛒 {t.cart} ({cart.reduce((total, item) => total + item.quantity, 0)})
          </button>
          <button
            type="button"
            onClick={() => setShowFavorites(!showFavorites)}
          >
            ❤️ {language === "ru"
              ? "Избранное"
              : language === "en"
              ? "Favorites"
              : "Sevimlilar"} ({favorites.length})
          </button>
          
          </div>
          </header>
          <div className="market-layout">
            <aside className="market-sidebar">
              <h3>☷ {i18n.language} — {translate("allCategories")}</h3>

              {marketCategories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => {
                    setCategory(category.name);
                    document.getElementById("products")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  <span>{category.icon}</span>
                  <span>
  {language === "ru"
    ? ({
        "Ichimliklar": "Напитки",
        "Oziq-ovqat mahsulotlari": "Продукты питания",
        "Shirinliklar": "Сладости",
        "Maishiy kimyo": "Бытовая химия",
        "Gigiyena vositalari": "Средства гигиены",
        "Bolalar uchun": "Для детей",
        "Uy-ro‘zg‘or": "Товары для дома",
        "Elektronika": "Электроника"
      }[category.name] || category.name)
    : language === "en"
    ? ({
        "Ichimliklar": "Drinks",
        "Oziq-ovqat mahsulotlari": "Groceries",
        "Shirinliklar": "Sweets",
        "Maishiy kimyo": "Household cleaning",
        "Gigiyena vositalari": "Personal care",
        "Bolalar uchun": "Kids",
        "Uy-ro‘zg‘or": "Home goods",
        "Elektronika": "Electronics"
      }[category.name] || category.name)
    : category.name}
</span>
                  <span>›</span>
                </button>
              ))}
            </aside>


<section className="hero">
  <div className="hero-content">

<div className="hero-badge">
  👑 {language === "ru"
    ? "Лучшие предложения для вас"
    : language === "en"
    ? "Best picks for you"
    : "Siz uchun eng yaxshi tanlovlar"}
</div>
<h1>
  {language === "ru"
    ? "Добро пожаловать"
    : language === "en"
    ? "Welcome to"
    : "MiniMarketga"}
  <br />
  <span>
    {language === "ru"
      ? "в MiniMarket!"
      : language === "en"
      ? "MiniMarket!"
      : "xush kelibsiz!"}
  </span>
</h1>

<p>
  {language === "ru"
    ? "Лучшие товары по выгодным ценам."
    : language === "en"
    ? "The best products at great prices."
    : "Eng yaxshi mahsulotlar — qulay narxlarda."}

  <br />

  {language === "ru"
    ? "Надёжный выбор для ваших ежедневных покупок!"
    : language === "en"
    ? "A trusted choice for your everyday shopping!"
    : "Sizning kundalik xaridlaringiz uchun ishonchli tanlov!"}
</p>
    <button
      className="hero-shop-btn"
      onClick={() => {
        setShowProducts((prev) => !prev);
        setTimeout(() => {
          document.getElementById("products")?.scrollIntoView({
            behavior: "smooth",
          });
        }, 100);
      }}
    >
      🛒 {language === "ru"
  ? "Смотреть товары"
  : language === "en"
  ? "Shop products"
  : "Mahsulotlarni ko‘rish"}
      <span>➜</span>
    </button>

    <div className="hero-features">
  <div>
    🚚 {language === "ru" ? "Быстрая доставка" : language === "en" ? "Fast delivery" : "Tez yetkazib berish"}
  </div>

  <div>
    🛡️ {language === "ru" ? "Надёжные покупки" : language === "en" ? "Secure shopping" : "Ishonchli xaridlar"}
  </div>

  <div>
    💎 {language === "ru" ? "Выгодные цены" : language === "en" ? "Great prices" : "Qulay narxlar"}
  </div>
</div>


  </div>

  <div className="hero-visual">
    <div className="hero-discount">🔥 -30%</div>

    <div className="hero-new">
      ⭐ ⭐ {language === "ru" ? "Новинка" : language === "en" ? "New" : "Yangi"}
    </div>

    <img
      src="/grocery-basket.png"
      alt="MiniMarket mahsulotlari"
      className="hero-image"
    />

    <div className="hero-floating hero-floating-one">✨</div>
    <div className="hero-floating hero-floating-two">💜</div>
  </div>
</section>
      <div className="promo-cards">
        <div className="promo-card promo-sale">
          <span className="promo-icon">🎁</span>
          <h3>{language === "ru" ? "Акции и скидки" : language === "en" ? "Promotions and discounts" : "Aksiyalar va chegirmalar"}</h3>
          <p>
  {language === "ru"
    ? "Лучшие предложения здесь!"
    : language === "en"
    ? "Discover our best offers!"
    : "Eng yaxshi takliflar shu yerda!"}
</p>
          <button
            onClick={() =>
              document.getElementById("products")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            {language === "ru" ? "Смотреть" : language === "en" ? "View" : "Ko‘rish"} →
          </button>
        </div>

        <div className="promo-card promo-delivery">
          <span className="promo-icon">🚚</span>
          <h3>
  {language === "ru"
    ? "Быстрая доставка"
    : language === "en"
    ? "Fast delivery"
    : "Tez yetkazib berish"}
</h3>
          <p>
  {language === "ru"
    ? "Быстрая и надёжная доставка по Ташкенту"
    : language === "en"
    ? "Fast and reliable delivery across Tashkent"
    : "Toshkent bo‘ylab tez va ishonchli yetkazib berish"}
</p>
          <button
            onClick={() =>
              alert("Yetkazib berish xizmati haqida ma'lumot tez orada!")
            }
          >
            {language === "ru" ? "Подробнее" : language === "en" ? "Learn more" : "Batafsil"} →
          </button>
        </div>
      </div>
      </div>
      <div className="category-strip">
        {[
          { name: "Ichimliklar", image: "/categories/drinks.jpg" },
          { name: "Oziq-ovqat mahsulotlari", image: "/categories/food.jpg" },
          { name: "Shirinliklar", image: "/categories/sweets.jpg" },
          { name: "Maishiy kimyo", image: "/categories/cleaning.jpg" },
          { name: "Gigiyena vositalari", image: "/categories/hygiene.jpg" },
          { name: "Bolalar uchun", image: "/categories/bolalar.jpg" },
          { name: "Uy-ro‘zg‘or", image: "/categories/home.jpg" },
          { name: "Elektronika", image: "/categories/electronics.jpg" },
        ].map((item) => (
          <button
            key={item.name}
            type="button"
            className="category-strip-item"
            onClick={() => {
              setCategory(item.name);
              document.getElementById("products")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            <span className="category-strip-icon">
              <img src={item.image} alt={item.name} />
            </span>
            <span>
  {language === "ru"
    ? ({
        "Ichimliklar": "Напитки",
        "Oziq-ovqat mahsulotlari": "Продукты питания",
        "Shirinliklar": "Сладости",
        "Maishiy kimyo": "Бытовая химия",
        "Gigiyena vositalari": "Средства гигиены",
        "Bolalar uchun": "Для детей",
        "Uy-ro‘zg‘or": "Товары для дома",
        "Elektronika": "Электроника"
      }[item.name] || item.name)
    : language === "en"
    ? ({
        "Ichimliklar": "Drinks",
        "Oziq-ovqat mahsulotlari": "Groceries",
        "Shirinliklar": "Sweets",
        "Maishiy kimyo": "Household cleaning",
        "Gigiyena vositalari": "Personal care",
        "Bolalar uchun": "Kids",
        "Uy-ro‘zg‘or": "Home goods",
        "Elektronika": "Electronics"
      }[item.name] || item.name)
    : item.name}
</span>
          </button>
        ))}
      </div>


<main
  id="products"
  className="container products-page"
  style={{ display: showProducts ? "block" : "none" }}
>
  <div className="products-page-header">
    <button
      type="button"
      className="back-home-btn"
      onClick={() => {
        setShowProducts(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      ← {language === "ru"
  ? "На главную"
  : language === "en"
  ? "Back to home"
  : "Bosh sahifaga qaytish"}
    </button>

    <div className="products-page-title">
      <h1>
  🛍️ {language === "ru"
    ? "Все товары"
    : language === "en"
    ? "All products"
    : "Barcha mahsulotlar"}
</h1>
      <p>
  {language === "ru"
    ? "Покупайте лучшие товары по выгодным ценам!"
    : language === "en"
    ? "Shop the best products at great prices!"
    : "Eng yaxshi mahsulotlarni qulay narxlarda xarid qiling!"}
</p>
    </div>
  </div>
        <h2>🔥 {t.popular}</h2>
        
<div className="filters">
<select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="Barchasi">{t.allCategories}</option>

  {marketCategories.map((item) => (
    <option key={item.name} value={item.name}>
      {item.icon} {item.name}
    </option>
  ))}
</select>

  <input
    type="number"
    min="0"
    placeholder={t.minPrice}
    value={minPrice}
    onChange={(e) => setMinPrice(e.target.value)}
  />

  <input
    type="number"
    min="0"
    placeholder={t.maxPrice}
    value={maxPrice}
    onChange={(e) => setMaxPrice(e.target.value)}
  />

  <select value={sort} onChange={(e) => setSort(e.target.value)}>
    <option value="newest">{t.newest}</option>
    <option value="cheap">Arzonidan qimmatiga</option>
    <option value="expensive">Qimmatidan arzoniga</option>
  </select>
</div>

        <div className="products">
          
          {productsLoading && (
            <div style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "60px 20px",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#6938ef"
            }}>
              ⏳ Mahsulotlar yuklanmoqda, iltimos kuting...
            </div>
          )}
      {!productsLoading && (
        filteredProducts.length === 0 ? (
          <div className="empty-products">
            <div className="empty-products-icon">📦</div>

            <h2>Hozircha mahsulotlar mavjud emas</h2>

            <p>
              Ushbu kategoriyaga hali mahsulot qo‘shilmagan.
              <br />
              Tez orada yangi mahsulotlar paydo bo‘ladi!
            </p>

            <button
              type="button"
              onClick={() => {
                setCategory("Barchasi");
                setSearch("");
                setMinPrice("");
                setMaxPrice("");
              }}
            >
              🛍️ Barcha mahsulotlarni ko‘rish
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              className="product-card"
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              style={{ cursor: "pointer" }}
            >
              <span className="product-new-badge">✨ Tavsiya etiladi</span>
<img
  src={
    productImages[product.name] ||
    product.image_url ||
    "/no-image.svg"
  }
  alt=""
  className="product-image"
  loading="lazy"
  onError={(e) => {
    const img = e.currentTarget;

    if (!img.src.endsWith("/no-image.svg")) {
      img.src = "/no-image.svg";
    } else {
      img.style.visibility = "hidden";
    }
  }}
/>

              <div className="product-info">
                <span>
                  {language === "ru"
                    ? {
                        Elektronika: "Электроника",
                        "Kiyim-kechak": "Одежда",
                        "Uy jihozlari": "Товары для дома",
                        Sport: "Спорт",
                        Boshqalar: "Другие"
                      }[product.category] || product.category
                    : language === "en"
                    ? {
                        Elektronika: "Electronics",
                        "Kiyim-kechak": "Clothing",
                        "Uy jihozlari": "Home goods",
                        Sport: "Sport",
                        Boshqalar: "Others"
                      }[product.category] || product.category
                    : product.category}
                </span>
                
                <h3
                  onClick={() => setSelectedProduct(product)}
                  style={{ cursor: "pointer" }}
                >
                  {product.name}
                </h3>
                <button
                  type="button"
                  className="favorite-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                >
                  {favorites.includes(product.id) ? "❤️" : "🤍"}
                </button>

                <div className="product-price-box">
                  {Number(product.old_price) > Number(product.price) && (
                    <div className="old-price-row">
                      <span className="old-price">
                        {Number(product.old_price).toLocaleString("ru-RU")} so‘m
                      </span>

                      <span className="discount-badge">
                        -{Math.round(
                          (1 - Number(product.price) / Number(product.old_price)) * 100
                        )}%
                      </span>
                    </div>
                  )}

                  <h3 className="price">
                    {Number(product.price).toLocaleString("ru-RU", {
                      maximumFractionDigits: 0
                    })} so‘m
                  </h3>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                >
                  Savatchaga qo'shish
                </button>

              </div>
            </div>
          )))
        )}
        </div>
{selectedProduct && (
  <div
    className="auth-overlay product-modal-overlay"
    onClick={() => setSelectedProduct(null)}
  >
    <div
      className="product-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="product-modal-close"
        onClick={() => setSelectedProduct(null)}
        aria-label="Yopish"
      >
        ✕
      </button>

      <div className="pm-layout">
        {/* CHAP TOMON — MAHSULOT RASMI */}
        <div className="pm-gallery">
          <div className="pm-image-box">
            <span className="pm-recommend">✨ Tavsiya etiladi</span>

            <img
              src={
                productImages[selectedProduct.name] ||
                selectedProduct.image_url ||
                "/no-image.svg"
              }
              alt={selectedProduct.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/no-image.svg";
              }}
            />

            <button
              type="button"
              className="pm-image-heart"
              onClick={() => toggleFavorite(selectedProduct.id)}
            >
              {favorites.includes(selectedProduct.id) ? "❤️" : "🤍"}
            </button>
          </div>
        </div>

        {/* O‘NG TOMON — MAHSULOT MA'LUMOTLARI */}
        <div className="pm-details">
          <div className="pm-breadcrumb">
            🏠 Bosh sahifa › {selectedProduct.category}
          </div>

          <span className="pm-category">
            {selectedProduct.category}
          </span>

          <h1 className="pm-title">{selectedProduct.name}</h1>

          {/* Sotuvchining o‘z mahsulotini boshqarishi */}
          {user?.role === "seller" &&
            String(user?.id) === String(selectedProduct.seller_id) && (
              <div className="seller-product-actions">
                <button
                  type="button"
                  className="seller-edit-btn"
                  onClick={() => {
                    setEditingProduct(selectedProduct);
                    setSelectedProduct(null);
                    setShowSellerPanel(true);
                  }}
                >
                  ✏️ Mahsulotni tahrirlash
                </button>

                <button
                  type="button"
                  className="seller-delete-btn"
onClick={() => {
  handleDeleteProduct(selectedProduct.id);
}}
                >
                  🗑️ Mahsulotni o‘chirish
                </button>
              </div>
            )}

          <div className="pm-rating">
            <span className="pm-stars">★★★★★</span>
            <span>Mahsulot haqida ma'lumot</span>
          </div>

          <div className="pm-price-row">
            <strong className="pm-price">
              {Number(selectedProduct.price).toLocaleString("uz-UZ")} so‘m
            </strong>
          </div>

          <div className="pm-stock">
            <span>✓</span> Sotuvda mavjud
          </div>

          <p className="pm-description">
            {selectedProduct.description ||
              "Mahsulot haqida batafsil ma'lumot. MiniMarket orqali qulay narxlarda xarid qiling."}
          </p>

          <div className="pm-buy-row">
            <div className="pm-quantity">
              <button
                type="button"
                onClick={() =>
                  setProductQuantity((prev) => Math.max(1, prev - 1))
                }
              >
                −
              </button>

              <strong>{productQuantity}</strong>

              <button
                type="button"
                onClick={() => setProductQuantity((prev) => prev + 1)}
              >
                +
              </button>
            </div>

<button
  type="button"
  className="pm-add-cart"
  onClick={() => {
    const quantity = productQuantity;

    for (let i = 0; i < quantity; i++) {
      addToCart(selectedProduct);
    }

    setProductQuantity(1);
    setSelectedProduct(null);

    alert(
      `✅ ${selectedProduct.name}\n${quantity} dona savatchaga qo‘shildi!`
    );
  }}
>
  🛒 Savatchaga qo‘shish
</button>
          </div>

          <div className="pm-action-row">
            <button
              type="button"
              className="pm-favorite"
              onClick={() => toggleFavorite(selectedProduct.id)}
            >
              {favorites.includes(selectedProduct.id)
                ? "❤️ Sevimlilardan olib tashlash"
                : "🤍 Sevimlilarga qo‘shish"}
            </button>

            <button
              type="button"
              className="pm-share"
              onClick={async () => {
                try {
                  if (navigator.share) {
                    await navigator.share({
                      title: selectedProduct.name,
                      url: window.location.href,
                    });
                  } else if (navigator.clipboard) {
                    await navigator.clipboard.writeText(
                      window.location.href
                    );
                    alert("Havola nusxalandi!");
                  } else {
                    alert("Ulashish funksiyasi mavjud emas.");
                  }
                } catch (error) {
                  if (error.name !== "AbortError") {
                    alert("Havolani ulashib bo‘lmadi.");
                  }
                }
              }}
            >
              🔗 Ulashish
            </button>
          </div>

          <div className="pm-total">
            <span>💰 Umumiy narx</span>
            <strong>
              {(
                Number(selectedProduct.price) * productQuantity
              ).toLocaleString("uz-UZ")} so‘m
            </strong>
          </div>
        </div>
      </div>

      {/* XIZMATLAR */}
      <div className="pm-services">
        <div className="pm-service">
          <span>🚚</span>
          <div>
            <strong>Tez yetkazib berish</strong>
            <small>Toshkent bo‘ylab</small>
          </div>
        </div>

        <div className="pm-service">
          <span>🛡️</span>
          <div>
            <strong>Ishonchli xarid</strong>
            <small>Qulay va xavfsiz</small>
          </div>
        </div>

        <div className="pm-service">
          <span>💳</span>
          <div>
            <strong>Qulay to‘lovlar</strong>
            <small>To‘lov imkoniyatlari</small>
          </div>
        </div>

        <div className="pm-service">
          <span>🎧</span>
          <div>
            <strong>Yordam xizmati</strong>
            <small>Qo‘llab-quvvatlash</small>
          </div>
        </div>
      </div>

      {/* MAHSULOT TAVSIFI */}
      <div className="pm-bottom">
        <div className="pm-tabs">
          <span className="pm-tab-active">📄 Tavsif</span>
        </div>

        <div className="pm-description-card">
          <h3>Mahsulot tavsifi</h3>

          <p>
            {selectedProduct.description ||
              `${selectedProduct.name} — MiniMarket do‘konidagi mahsulot. Batafsil ma'lumot uchun sotuvchiga murojaat qiling.`}
          </p>

          <div className="pm-specifications">
            <h3>Mahsulot ma'lumotlari</h3>

            <div>
              <span>Mahsulot nomi</span>
              <strong>{selectedProduct.name}</strong>
            </div>

            <div>
              <span>Toifasi</span>
              <strong>{selectedProduct.category}</strong>
            </div>

            <div>
              <span>Narxi</span>
              <strong>
                {Number(selectedProduct.price).toLocaleString("uz-UZ")} so‘m
              </strong>
            </div>

            <div>
              <span>Mahsulot kodi</span>
              <strong>#{selectedProduct.id}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
{showFavorites && (
  <div
    className="cart-overlay"
    onClick={() => setShowFavorites(false)}
  >
    <div
      className="cart-modal"
      onClick={(e) => e.stopPropagation()}
    >
<button
  type="button"
  className="cart-close"
  onClick={() => {
    setShowFavorites(false);

    if (user?.role === "buyer") {
      setShowBuyerPanel(true);
    }
  }}
>
  X
</button>

      <div className="cart-box">
        <div className="cart-header">
          <div className="cart-header-icon">❤️</div>

          <div>
            <h2>Sevimli mahsulotlarim</h2>
            <p>Siz tanlagan mahsulotlar</p>
          </div>

          <span className="cart-count">
            {favorites.length}
          </span>
        </div>

        {favorites.length === 0 ? (
          <p>Hozircha sevimli mahsulotlar yo‘q ❤️</p>
        ) : (
dbProducts
  .filter((product) =>
    favorites.some((id) => String(id) === String(product.id))
  )
  .map((product) => (
              <div className="cart-item" key={product.id}>
                <div className="cart-product">
                  <img
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/no-image.svg";
                  }}
                    src={
                      productImages[product.name] ||
                      product.image_url ||
                      "/no-image.svg"
                    }
                    alt=""
                    className="cart-product-image"
                  />

                  <div className="cart-product-details">
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>
                </div>

                <div className="cart-unit-price">
                  {Number(product.price).toLocaleString("uz-UZ")} so‘m
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addToCart(product);
                  }}
                >
                  🛒 Savatchaga
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(product.id)}
                >
                  🗑️ Olib tashlash
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  </div>
)}
        
        {showCart && (
          <div
            className="cart-overlay"
            onClick={() => setShowCart(false)}
          >
            <div
              className="cart-modal"
              onClick={(e) => e.stopPropagation()}
            >
  <button
  type="button"
  className="cart-close"
onClick={() => {
  setShowCart(false);
  setShowBuyerPanel(false);
}}
>
  ✕
</button>

              <div className="cart-box">
                <div className="cart-header">
                  <div className="cart-header-icon">🛒</div>

                  <div>
                    <h2>Mening savatcham</h2>
                    <p>Siz tanlagan mahsulotlar ro‘yxati</p>
                  </div>

                  <span className="cart-count">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                </div>


          {cart.length === 0 ? (
            <p>Savatcha bo'sh</p>
          ) : (
            <>
              {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-product">
<img
  src={
    productImages[item.name] ||
    item.image_url ||
    item.image ||
    "/no-image.svg"
  }
  alt={item.name}
  className="cart-product-image"
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "/no-image.svg";
  }}
/>

                  <div className="cart-product-details">
                    <strong>{item.name}</strong>
                    <span>{item.category}</span>
                  </div>
                </div>

                <div className="cart-unit-price">
                  {Number(item.price).toLocaleString("uz-UZ")} so‘m
                </div>

                <div className="cart-quantity">
                  <button
                    type="button"
                    onClick={() => changeQuantity(item.id, -1)}
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() => changeQuantity(item.id, 1)}
                  >
                    +
                  </button>
                </div>

                <strong className="cart-item-total">
                  {(Number(item.price) * item.quantity).toLocaleString("uz-UZ")} so‘m
                </strong>

                <button
                  type="button"
                  className="cart-remove"
                  onClick={() =>
                    setCart((prev) => prev.filter((p) => p.id !== item.id))
                  }
                >
                  🗑️
                </button>
              </div>
              ))}

              <h3>
                Jami: {cart.reduce(
                  (total, item) => total + item.price * item.quantity,
                  0
                ).toLocaleString("uz-UZ")} so'm
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCart(false);
                  setShowBuyerPanel(false);
                  setShowFavorites(false);
                  setShowOrderForm(true);
                }}
                style={{
                  backgroundColor: "#6c3bff",
                  color: "white",
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "15px"
                }}
              >
                🛒 Buyurtma berish
              </button>

            </>
          )}
        </div>
            </div>
  </div>
      )}
                {showOrderForm && (
                <div className="order-form">
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <h2>📦 Buyurtma ma'lumotlari</h2>

                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        cursor: "pointer"
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handlePlaceOrder} className="checkout-form">

                    <div className="checkout-section-title">
                      👤 Shaxsiy ma'lumotlar
                    </div>

                    <div className="checkout-field">
                      <label>Ismingiz</label>
                      <input
                        type="text"
                        name="customer_name"
                        placeholder="Ismingizni kiriting"
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label>Telefon raqamingiz</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+998 90 123 45 67"
                        required
                      />
                    </div>

                    <div className="checkout-section-title">
                      🚚 Yetkazib berish
                    </div>

                    <div className="checkout-field">
                      <label>Yetkazib berish manzili</label>
                      <input
                        type="text"
                        name="address"
                        placeholder="Tuman, ko'cha, uy raqami"
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label>Buyurtmaga izoh (ixtiyoriy)</label>
                      <textarea
                        name="comment"
                        placeholder="Masalan: 3-qavat, 12-xonadon"
                        rows="3"
                      />
                    </div>
                    <div className="checkout-field">
                      <label htmlFor="payment-method">💳 To‘lov usuli</label>

<select
  id="payment-method"
  name="payment_method"
  defaultValue="cash"
  required
>
  <option value="cash">
    💵 Naqd pul (yetkazib berilganda)
  </option>

  <option value="card">
    💳 Karta orqali (yetkazib berilganda)
  </option>

  <option value="click">
    📱 Click orqali onlayn to‘lov
  </option>

  <option value="payme">
    💳 Payme orqali onlayn to‘lov
  </option>
</select>
                    </div>

                    <div className="checkout-summary">
                      <span>💰 Jami to'lov:</span>

                      <strong>
                        {cart.reduce(
                          (total, item) => total + Number(item.price) * item.quantity,
                          0
                        ).toLocaleString("uz-UZ")} so'm
                      </strong>
                    </div>

                    <div className="checkout-actions">
                      <button type="submit" className="checkout-submit">
                        ✅ Buyurtmani tasdiqlash
                      </button>

                      <button
                        type="button"
                        className="checkout-cancel"
                        onClick={() => setShowOrderForm(false)}
                      >
                        Bekor qilish
                      </button>
                    </div>

                  </form>
                </div>
              )}
              {showLogin && (
  <div className="auth-overlay" onClick={() => setShowLogin(false)}>
    <div
      className="auth-box login-modern"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="login-close"
        onClick={() => setShowLogin(false)}
      >
        ✕
      </button>

      <div className="login-icon">🔐</div>

      <h2>
        {isRegister ? "Ro‘yxatdan o‘tish" : "Tizimga kirish"}
      </h2>

      <p className="login-subtitle">
        {isRegister
          ? "MiniMarket oilasiga qo‘shiling"
          : "MiniMarket hisobingizga xush kelibsiz!"}
      </p>

      <form onSubmit={handleAuth} className="login-form">
        {isRegister && (
          <div className="login-field">
            <label>Ismingiz</label>
            <input
              type="text"
              placeholder="Ismingizni kiriting"
              value={authName}
              onChange={(e) => setAuthName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="login-field">
          <label>Email manzilingiz</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-field">
          <label>Parolingiz</label>

          <div className="login-password">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Parolingizni kiriting"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"
              }
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

{isRegister && (
  <div className="login-field">
    <label>Hisob turini tanlang</label>

    <div className="role-selection">
      <button
        type="button"
        className={`role-card ${authRole === "buyer" ? "active" : ""}`}
        onClick={() => setAuthRole("buyer")}
      >
        <span className="role-icon">🛍️</span>
        <strong>Xaridor</strong>
        <small>Mahsulot xarid qilish</small>
      </button>

      <button
        type="button"
        className={`role-card ${authRole === "seller" ? "active" : ""}`}
        onClick={() => setAuthRole("seller")}
      >
        <span className="role-icon">🏪</span>
        <strong>Sotuvchi</strong>
        <small>Mahsulot sotish</small>
      </button>
    </div>
  </div>
)}

        <button type="submit" className="login-submit">
          {isRegister ? "✨ Ro‘yxatdan o‘tish" : "🔐 Kirish"}
        </button>
      </form>
      {!isRegister && (
        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <div style={{ marginBottom: "12px", color: "#777" }}>
            yoki
          </div>

          <div id="google-signin-button"></div>
        </div>
      )}

      <button
        type="button"
        className="login-cancel"
        onClick={() => setShowLogin(false)}
      >
        Yopish
      </button>
    </div>
  </div>
)}
      {showSellerPanel && user?.role === "seller" && (
        <div className="auth-overlay">
          <div className="auth-box seller-modal-scroll seller-modal">

            <button
              type="button"
              className="seller-close-x"
              onClick={() => setShowSellerPanel(false)}
              aria-label="Sotuvchi kabinetini yopish"
            >
              ✕
            </button>
            <h2>🏪 Sotuvchi kabineti</h2>
            <p>Xush kelibsiz, {user.name}!</p>
            <button
              type="button"
              onClick={() => {
                setUser(null);
                setToken("");
                setShowSellerPanel(false);
                setShowCart(false);
                setShowOrderForm(false);
              }}
            >
              {language === "ru"
  ? "Выйти"
  : language === "en"
  ? "Log out"
  : "Akkauntdan chiqish"}
            </button>
            
            <h3>📦 Kelgan buyurtmalar</h3>

            <button
              type="button"
              onClick={loadSellerOrders}
            >
              🔄 Buyurtmalarni yangilash
            </button>

            {ordersLoading ? (
              <p>Buyurtmalar yuklanmoqda...</p>
            ) : sellerOrders.length === 0 ? (
              <p>Hozircha buyurtmalar yo'q.</p>
            ) : (
              <div>
                {sellerOrders.map((order) => (
                  <div
                    key={order.item_id}
                    style={{
                      padding: "15px",
                      marginTop: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "8px"
                    }}
                  >
                    <p>📦 Mahsulot: {order.product_name}</p>
                    <p>🔢 Soni: {order.quantity}</p>
                    <p>💰 Narxi: {Number(order.unit_price).toLocaleString()} so'm</p>
                    <p>📋 Holati: {order.status}</p>
                    <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.item_id, "Jarayonda")}
                        disabled={order.status === "Jarayonda" || order.status === "Yetkazilgan"}
                        style={{
                          background: "#2563eb",
                          color: "white",
                          padding: "10px",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer"
                        }}
                      >
                        🔵 Jarayonda
                      </button>

                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.item_id, "Yetkazilgan")}
                        disabled={order.status === "Yetkazilgan"}
                        style={{
                          background: "#16a34a",
                          color: "white",
                          padding: "10px",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer"
                        }}
                      >
                        🟢 Yetkazilgan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}


            <h3>Mahsulot qo'shish</h3>


            <form onSubmit={handleAddProduct}>


          <div className="seller-form-field">
            <label htmlFor="add-product-name">
              📦 Mahsulot nomi
            </label>

            <input
              id="add-product-name"
              type="text"
              name="name"
              placeholder="Masalan: iPhone 15 Pro Max"
              required
            />

            <small>
              Sotmoqchi bo‘lgan mahsulotingizning to‘liq nomini kiriting.
            </small>
          </div>


              <input
                type="number"
                name="price"
                placeholder="Mahsulot narxi"
                min="1"
                required
              />

              <select name="category" required>
                <option value="">Kategoriyani tanlang</option>

                <option value="Oziq-ovqat">🍎 Oziq-ovqat</option>
                <option value="Ichimliklar">🥤 Ichimliklar</option>
                <option value="Elektronika">📱 Elektronika</option>
                <option value="Kiyim-kechak">👕 Kiyim-kechak</option>
                <option value="Uy-ro'zg'or">🏠 Uy-ro‘zg‘or</option>
                <option value="Shirinliklar">🍫 Shirinliklar</option>
                <option value="Maishiy kimyo">🧼 Maishiy kimyo</option>
                <option value="Gigiyena vositalari">🧴 Gigiyena vositalari</option>
                <option value="Bolalar uchun">🧸 Bolalar uchun</option>
                <option value="Sport">⚽ Sport</option>
                <option value="Go'zallik">💄 Go‘zallik</option>
                <option value="Boshqalar">📦 Boshqalar</option>
              </select>

              <input
                type="url"
                name="image_url"
                placeholder="Mahsulot rasmi URL"
                required
              />

              <button type="submit">
                Mahsulot qo'shish
              </button>
            </form>


            
            {editingProduct && (
              <div className="edit-product">
                <h3>✏️ Mahsulotni tahrirlash</h3>

<form onSubmit={handleUpdateProduct} className="seller-modern-form">

  <div className="seller-form-grid">

    <div className="seller-form-field">
      <label>📦 Mahsulot nomi</label>
      <input
        type="text"
        name="name"
        defaultValue={editingProduct.name}
        placeholder="Masalan: iPhone 15 Pro Max"
        required
      />
      <small>Mahsulotning to‘liq nomini kiriting.</small>
    </div>

    <div className="seller-form-field">
      <label>💰 Sotuv narxi (so‘m)</label>
      <input
        type="number"
        name="price"
        defaultValue={editingProduct.price}
        placeholder="Masalan: 80000"
        min="1"
        required
      />
      <small>Xaridor to‘laydigan narx.</small>
    </div>

    <div className="seller-form-field">
      <label>🏷️ Eski narx (so‘m)</label>
      <input
        type="number"
        name="old_price"
        defaultValue={editingProduct.old_price ?? ""}
        placeholder="Masalan: 100000"
        min="1"
        step="any"
      />
      <small>Chegirmadan oldingi narx (ixtiyoriy).</small>
    </div>

    <div className="seller-form-field">
      <label>🔥 Chegirma foizi (%)</label>
      <input
        type="number"
        name="discount_percent"
        defaultValue={editingProduct.discount_percent ?? 0}
        placeholder="Masalan: 20"
        min="0"
        max="100"
        step="any"
      />
      <small>0 dan 100 gacha chegirma kiriting.</small>
    </div>

    <div className="seller-form-field">
      <label>📂 Mahsulot kategoriyasi</label>

      <select
        name="category"
        defaultValue={editingProduct.category}
        required
      >
        <option value="Oziq-ovqat">🍎 Oziq-ovqat</option>
        <option value="Ichimliklar">🥤 Ichimliklar</option>
        <option value="Elektronika">📱 Elektronika</option>
        <option value="Kiyim-kechak">👕 Kiyim-kechak</option>
        <option value="Uy-ro'zg'or">🏠 Uy-ro‘zg‘or</option>
        <option value="Shirinliklar">🍬 Shirinliklar</option>
        <option value="Maishiy kimyo">🧼 Maishiy kimyo</option>
        <option value="Gigiyena vositalari">🧴 Gigiyena vositalari</option>
        <option value="Bolalar uchun">🧸 Bolalar uchun</option>
        <option value="Sport">⚽ Sport</option>
        <option value="Go'zallik">💄 Go‘zallik</option>
        <option value="Boshqalar">📦 Boshqalar</option>
      </select>

      <small>Mahsulot qaysi turga kirishini tanlang.</small>
    </div>

    <div className="seller-form-field">
      <label>🖼️ Mahsulot rasmi URL</label>

      <input
        type="url"
        name="image_url"
        defaultValue={editingProduct.image_url}
        placeholder="https://example.com/rasm.jpg"
        required
      />

      <small>Mahsulot rasmining internet manzilini kiriting.</small>
    </div>

  </div>

  <div className="seller-form-actions">

    <button type="submit" className="seller-save-btn">
      💾 O‘zgarishlarni saqlash
    </button>

    <button
      type="button"
      className="seller-cancel-btn"
      onClick={() => setEditingProduct(null)}
    >
      ✖ Bekor qilish
    </button>

  </div>

</form>
              </div>
            )}
            {deleteProductId !== null && (
  <div className="delete-modal-overlay">
    <div className="delete-modal">
      <div className="delete-modal-icon">🗑️</div>

      <h2>Mahsulotni o‘chirish</h2>

      <p>
        Haqiqatan ham ushbu mahsulotni o‘chirmoqchimisiz?
        Bu amalni ortga qaytarib bo‘lmaydi.
      </p>

      <div className="delete-modal-actions">
        <button
          type="button"
          className="delete-cancel-btn"
          onClick={() => setDeleteProductId(null)}
        >
          Bekor qilish
        </button>

        <button
          type="button"
          className="delete-confirm-btn"
          onClick={confirmDeleteProduct}
          disabled={deleteLoading}
        >
          {deleteLoading ? "O‘chirilmoqda..." : "Ha, o‘chirish"}
        </button>
      </div>
    </div>
  </div>
)}


                        
            <h3>Mening mahsulotlarim</h3>

            {dbProducts
              .filter((product) => product.seller_id === user?.id)
              .map((product) => (
                <div key={product.id} className="seller-product">
                  <p>{product.name}</p>
                  <p>{Number(product.price).toLocaleString("uz-UZ")} so'm</p>

                  <button
                    type="button"
                    onClick={() => setEditingProduct(product)}
                  >
                    ✏️ Tahrirlash
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    🗑️ O'chirish
                  </button>
                </div>
              ))}



          </div>
        </div>
      )}
{showBuyerPanel && user?.role === "buyer" && (
  <div
    className="auth-overlay buyer-overlay"
    onClick={() => setShowBuyerPanel(false)}
  >
    <div
      className="buyer-dashboard"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="buyer-close"
        onClick={() => setShowBuyerPanel(false)}
      >
        ✕
      </button>

      <aside className="buyer-sidebar">
        <div className="buyer-profile">
          <div className="buyer-avatar">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2>{user.name}</h2>
          <p>Xush kelibsiz!</p>
          <span>👤 Xaridor hisobi</span>
        </div>

        <nav className="buyer-navigation">
          <button
            type="button"
            onClick={() => setShowBuyerPanel(false)}
          >
            🏠 Bosh sahifa
          </button>

          <button
            type="button"
            onClick={() => {
              setShowBuyerPanel(false);
              setShowCart(true);
            }}
          >
            🛒 Mening savatcham
            <span>{cart.length}</span>
          </button>

<button
  type="button"
  onClick={() => {
    if (cart.length === 0) {
      alert("Avval savatchaga mahsulot qo‘shing!");
      return;
    }

setShowBuyerPanel(false);
setShowFavorites(false);
setShowCart(true);
setShowOrderForm(true);
  }}
>
  📦 Buyurtma berish
</button>

          <button
            type="button"
            onClick={() => {
              setShowBuyerPanel(false);
              setShowFavorites(true);
            }}
          >
            ❤️ Sevimlilarim
            <span>{favorites.length}</span>
          </button>

          <button
            type="button"
            className="buyer-logout"
            onClick={() => {
              setUser(null);
              setToken("");
              setShowBuyerPanel(false);
              setShowCart(false);
              setShowOrderForm(false);
            }}
          >
            🚪 Akkauntdan chiqish
          </button>
        </nav>
      </aside>

      <section className="buyer-content">
        <div className="buyer-welcome">
          <div>
            <h1>
              Xush kelibsiz, <strong>{user.name}!</strong>
            </h1>
            <p>MiniMarket'da xarid qilishdan zavqlaning 🛍️</p>
          </div>
          <span className="buyer-welcome-icon">🛍️</span>
        </div>

        <h3>Tezkor amallar</h3>

        <div className="buyer-cards">
          <button
            type="button"
            className="buyer-card cart-card"
            onClick={() => {
              setShowBuyerPanel(false);
              setShowCart(true);
            }}
          >
            <span className="buyer-card-icon">🛒</span>
            <span className="buyer-card-count">
              {cart.reduce(
                (total, item) => total + item.quantity,
                0
              )}
            </span>
            <strong>Mening savatcham</strong>
            <small>Savatchadagi mahsulotlarni ko‘rish</small>
            <span className="buyer-card-arrow">➜</span>
          </button>

          <button
            type="button"
            className="buyer-card order-card"
            disabled={cart.length === 0}
            onClick={() => {
              setShowBuyerPanel(false);
              setShowOrderForm(true);
            }}
          >
            <span className="buyer-card-icon">📦</span>
            <strong>Buyurtma berish</strong>
            <small>Tanlangan mahsulotlarni buyurtma qilish</small>
            <span className="buyer-card-arrow">➜</span>
          </button>

          <button
            type="button"
            className="buyer-card favorite-card"
            onClick={() => {
              setShowBuyerPanel(false);
              setShowFavorites(true);
            }}
          >
            <span className="buyer-card-icon">❤️</span>
            <span className="buyer-card-count">
              {favorites.length}
            </span>
            <strong>Sevimlilarim</strong>
            <small>Saqlangan mahsulotlarni ko‘rish</small>
            <span className="buyer-card-arrow">➜</span>
          </button>
        </div>

        <div className="buyer-promo">
          <span>👑</span>
          <div>
            <h3>MiniMarket bilan qulay xarid qiling!</h3>
            <p>
              Sifatli mahsulotlar, qulay narxlar va
              ajoyib xarid tajribasi.
            </p>
          </div>
          <span>🛒</span>
        </div>
      </section>
    </div>
  </div>
)}
      
      </main>
    </div>
  );
}

export default App;



