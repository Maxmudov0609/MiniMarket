
import { useState, useEffect } from "react";
import "./App.css";

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

function App() {
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
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetch("https://minimarket-backend-r4co.onrender.com/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Mahsulotlarni olishda xatolik");
        }
        return response.json();
      })
      .then((data) => {
        setDbProducts(data);
      })
      .catch((error) => {
        console.error(error);
      });
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

    alert("Buyurtmangiz muvaffaqiyatli qabul qilindi!");
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
  }
}






  const filteredProducts = dbProducts
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "Barchasi" || product.category === category;

      const matchesMin =
        minPrice === "" || product.price >= Number(minPrice);

      const matchesMax =
        maxPrice === "" || product.price <= Number(maxPrice);

      return matchesSearch && matchesCategory && matchesMin && matchesMax;
    })
    .sort((a, b) => {
      if (sort === "cheap") return a.price - b.price;
      if (sort === "expensive") return b.price - a.price;
      return b.id - a.id;
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

      alert("Muvaffaqiyatli tizimga kirdingiz!");
    } catch (error) {
      alert(error.message);
    }
  };
  
const handleAddProduct = async (e) => {
  e.preventDefault();

  const form = e.currentTarget;

  const body = {
    name: form.elements.name.value,
    description: "",
    price: Number(form.elements.price.value),
    category: form.elements.category.value,
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

    alert("Mahsulot bazaga muvaffaqiyatli qo'shildi!");
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
    alert(error.message);
  }
};


const handleDeleteProduct = async (productId) => {
  const confirmed = window.confirm(
    "Haqiqatan ham mahsulotni o'chirmoqchimisiz?"
  );

  if (!confirmed) return;

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

    alert("Mahsulot muvaffaqiyatli o'chirildi!");
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
        <h2>🛍️ MiniMarket</h2>
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
                🚪 Akkauntdan chiqish
              </button>

              {user.role === "seller" && (
                <button
                  onClick={() => setShowSellerPanel(true)}
                >
                  🏪 Sotuvchi kabineti
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
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Tilni tanlash"
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              cursor: "pointer"
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
            ❤️ Sevimlilar ({favorites.length})
          </button>
          
          </div>
          </header>
          <div className="market-layout">
            <aside className="market-sidebar">
              <h3>☷ Barcha kategoriyalar</h3>

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
                  <span>{category.name}</span>
                  <span>›</span>
                </button>
              ))}
            </aside>


      <section className="hero">
        <div className="hero-content">
          <h1>{t.welcome}</h1>
          <p>{t.subtitle}</p>

          <button
            onClick={() => {
              document.getElementById("products").scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            {t.shop}
          </button>
        </div>

        <img
          className="hero-image"
          src="/grocery-basket.png"
          alt="MiniMarket mahsulotlari"
        />
      </section>
      <div className="promo-cards">
        <div className="promo-card promo-sale">
          <span className="promo-icon">🎁</span>
          <h3>Aksiyalar va chegirmalar</h3>
          <p>Eng yaxshi takliflar shu yerda!</p>
          <button
            onClick={() =>
              document.getElementById("products")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            Ko‘rish →
          </button>
        </div>

        <div className="promo-card promo-delivery">
          <span className="promo-icon">🚚</span>
          <h3>Tez yetkazib berish</h3>
          <p>Toshkent bo‘ylab tez va ishonchli yetkazib berish</p>
          <button
            onClick={() =>
              alert("Yetkazib berish xizmati haqida ma'lumot tez orada!")
            }
          >
            Batafsil →
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
            <span>{item.name}</span>
          </button>
        ))}
      </div>


      <main id="products" className="container">
        <h2>🔥 {t.popular}</h2>
        
<div className="filters">
  <select value={category} onChange={(e) => setCategory(e.target.value)}>
    <option value="Barchasi">{t.allCategories}</option>
    <option value="Elektronika">
      {language === "ru" ? "Электроника" : language === "en" ? "Electronics" : "Elektronika"}
    </option>
    <option value="Kiyim-kechak">
      {language === "ru" ? "Одежда" : language === "en" ? "Clothing" : "Kiyim-kechak"}
    </option>
    <option value="Uy jihozlari">
      {language === "ru" ? "Товары для дома" : language === "en" ? "Home goods" : "Uy jihozlari"}
    </option>
    <option value="Sport">
      {language === "ru" ? "Спорт" : "Sport"}
    </option>
    <option value="Boshqalar">
      {language === "ru" ? "Другие" : language === "en" ? "Others" : "Boshqalar"}
    </option>
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
          {filteredProducts
            .filter((product) => !showFavorites || favorites.includes(product.id))
            .map((product) => (
            <div
              className="product-card"
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={product.image_url || "/no-image.svg"}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/no-image.svg";
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
                <h3 className="price">
                  {Number(product.price).toLocaleString("ru-RU", {
                    maximumFractionDigits: 0
                  })} so‘m 
                </h3>
                
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
          ))}
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

              <div className="product-modal-image">
                <img
                  src={selectedProduct.image_url || "/no-image.svg"}
                  alt={selectedProduct.name}
                />
              </div>

              <div className="product-modal-info">
                <span className="product-modal-category">
                  {selectedProduct.category}
                </span>

                <h2>{selectedProduct.name}</h2>

                <p className="product-modal-description">
                  Mahsulot haqida batafsil ma'lumot.
                  Sifatli mahsulotlarni MiniMarket orqali
                  qulay narxlarda xarid qiling.
                </p>

                <h3 className="product-modal-price">
                  {Number(selectedProduct.price).toLocaleString("uz-UZ")} so‘m
                </h3>

                <p className="product-modal-delivery">
                  🚚 Toshkent bo‘ylab yetkazib berish
                </p>
                <div className="product-quantity">
                  <span>Miqdori:</span>

                  <div className="quantity-selector">
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
                      onClick={() =>
                        setProductQuantity((prev) => prev + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                

                <button
                  type="button"
                  className="product-modal-cart"
                  onClick={() => {
                    for (let i = 0; i < productQuantity; i++) {
                      addToCart(selectedProduct);
                    }

                    setProductQuantity(1);
                    setSelectedProduct(null);
                  }}
                >
                  🛒 Savatchaga qo‘shish
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showCart && user?.role !== "seller" && (
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
                onClick={() => setShowCart(false)}
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
                    src={item.image_url || item.image || "/no-image.svg"}
                    alt={item.name}
                    className="cart-product-image"
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
                onClick={() => setShowOrderForm(true)}
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
            </>
          )}
        </div>
            </div>
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
          <div className="auth-box seller-modal-scroll">

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
              🚪 Akkauntdan chiqish
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
                  </div>
                ))}
              </div>
            )}


            <h3>Mahsulot qo'shish</h3>


            <form onSubmit={handleAddProduct}>


              <input
                type="text"
                name="name"
                placeholder="Mahsulot nomi"
                required
              />


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

                <form onSubmit={handleUpdateProduct}>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingProduct.name}
                    placeholder="Mahsulot nomi"
                    required
                  />

                  <input
                    type="number"
                    name="price"
                    defaultValue={editingProduct.price}
                    placeholder="Mahsulot narxi"
                    min="1"
                    required
                  />

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
                    defaultValue={editingProduct.image_url}
                    placeholder="Mahsulot rasmi URL"
                    required
                  />

                  <button type="submit">
                    💾 Saqlash
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                  >
                    Bekor qilish
                  </button>
                </form>
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
    className="auth-overlay"
    onClick={() => setShowBuyerPanel(false)}
  >
    <div
      className="auth-box"
      onClick={(e) => e.stopPropagation()}
    >
      <h2>🛍️ Xaridor kabineti</h2>

      <p>Xush kelibsiz, {user.name}!</p>

      <p>👤 Hisob turi: Xaridor</p>

      <button
        type="button"
        onClick={() => {
          setShowBuyerPanel(false);
          setShowCart(true);
        }}
      >
        🛒 Mening savatcham
      </button>

      <button
        type="button"
        disabled={cart.length === 0}
        onClick={() => {
          setShowBuyerPanel(false);
          setShowOrderForm(true);
        }}
      >
        📦 Buyurtma berish
      </button>

      <button
        type="button"
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

      <button
        type="button"
        onClick={() => setShowBuyerPanel(false)}
      >
        Yopish
      </button>
    </div>
  </div>
)}
      
      </main>
    </div>
  );
}

export default App;



