
import { useState, useEffect } from "react";
import "./App.css";

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

function App() {
  const [dbProducts, setDbProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/products")
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
  
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showSellerPanel, setShowSellerPanel] = useState(false);
    
  const [sellerOrders, setSellerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);


  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
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
      "http://localhost:4000/api/seller/orders",
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
    const response = await fetch("http://localhost:4000/api/orders", {
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
      "http://localhost:4000/api/products"
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
        `http://localhost:4000/api/auth/${endpoint}`,
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
      "http://localhost:4000/api/products",
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
      "http://localhost:4000/api/products"
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
      `http://localhost:4000/api/products/${productId}`,
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
      `http://localhost:4000/api/products/${editingProduct.id}`,
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
    placeholder="Mahsulot qidirish..."
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
                Kirish
              </button>

              <button
                onClick={() => {
                  setIsRegister(true);
                  setShowLogin(true);
                }}
              >
                Ro'yxatdan o'tish
              </button>
            </>
          ) : (
            <>
              <span>👤 {user.name}</span>

              {user.role === "seller" && (
                <button
                  onClick={() => setShowSellerPanel(true)}
                >
                  🏪 Sotuvchi kabineti
                </button>
              )}
            </>
          )}

          <button onClick={() => setShowCart(!showCart)}>
            🛒 Savatcha ({cart.reduce((total, item) => total + item.quantity, 0)})
          </button>
          
          </div>
          </header>

      <section className="hero">
        <h1>MiniMarketga xush kelibsiz!</h1>
        <p>Eng yaxshi mahsulotlar — qulay narxlarda</p>
        <button>Mahsulotlarni ko'rish</button>
      </section>

      <main className="container">
        <h2>🔥 Mashhur mahsulotlar</h2>
        
<div className="filters">
  <select value={category} onChange={(e) => setCategory(e.target.value)}>
    <option value="Barchasi">Barcha kategoriyalar</option>
    <option value="Elektronika">Elektronika</option>
    <option value="Kiyim-kechak">Kiyim-kechak</option>
    <option value="Uy jihozlari">Uy jihozlari</option>
    <option value="Sport">Sport</option>
    <option value="Boshqalar">Boshqalar</option>
  </select>

  <input
    type="number"
    min="0"
    placeholder="Minimal narx"
    value={minPrice}
    onChange={(e) => setMinPrice(e.target.value)}
  />

  <input
    type="number"
    min="0"
    placeholder="Maksimal narx"
    value={maxPrice}
    onChange={(e) => setMaxPrice(e.target.value)}
  />

  <select value={sort} onChange={(e) => setSort(e.target.value)}>
    <option value="newest">Eng yangi</option>
    <option value="cheap">Arzonidan qimmatiga</option>
    <option value="expensive">Qimmatidan arzoniga</option>
  </select>
</div>

        <div className="products">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <img src={product.image_url} alt={product.name} />
              <div className="product-info">
                <span>{product.category}</span>
                <h3>{product.name}</h3>
                <h3 className="price">
                  {product.price.toLocaleString("uz-UZ")} so'm  
                </h3>
                
                <button onClick={() => addToCart(product)}>
                  Savatchaga qo'shish
                </button>

              </div>
            </div>
          ))}
        </div>
        
      {showCart && (
        <div className="cart-box">
          <h2>🛒 Mening savatcham</h2>

          {cart.length === 0 ? (
            <p>Savatcha bo'sh</p>
          ) : (
            <>
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <span>{item.name} — {item.quantity} dona</span>
                  <div className="quantity-controls">
                    <button
                      onClick={() => changeQuantity(item.id, -1)}
                    >
                      ➖
                    </button>

                    <span>{item.quantity} dona</span>

                    <button
                      onClick={() => changeQuantity(item.id, 1)}
                    >
                      ➕
                    </button>
                  </div>
                  <strong>
                    {(item.price * item.quantity).toLocaleString("uz-UZ")} so'm
                  </strong>
                  <button
                    type="button"
                    onClick={() =>
                      setCart((prev) =>
                        prev.filter((p) => p.id !== item.id)
                      )
                    }
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      padding: "10px",
                      marginLeft: "10px",
                      display: "inline-block",
                      cursor: "pointer"
                    }}
                  >
                    ❌ O'chirish
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
                  <h2>📦 Buyurtma ma'lumotlari</h2>

                  <form onSubmit={handlePlaceOrder}>

                    <input
                      type="text"
                      name="customer_name"
                      placeholder="Ismingiz"
                      required
                    />

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Telefon raqamingiz"
                      required
                    />

                    <input
                      type="text"
                      name="address"
                      placeholder="Yetkazib berish manzili"
                      required
                    />

                    <textarea
                      placeholder="Buyurtma izohi (ixtiyoriy)"
                    />

                    <button type="submit">
                      Buyurtmani tasdiqlash
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                    >
                      Bekor qilish
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {showLogin && (
        <div className="auth-overlay">
          <div className="auth-box">
            <h2>{isRegister ? "Ro‘yxatdan o‘tish" : "Tizimga kirish"}</h2>

            <form onSubmit={handleAuth}>
              {isRegister && (
                <input
                  type="text"
                  placeholder="Ismingiz"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                />
              )}

              <input
                type="email"
                placeholder="Email manzilingiz"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Parolingiz"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                minLength={8}
                required
              />

              {isRegister && (
                <select
                  value={authRole}
                  onChange={(e) => setAuthRole(e.target.value)}
                >
                  <option value="buyer">Xaridor</option>
                  <option value="seller">Sotuvchi</option>
                </select>
              )}

              <button type="submit">
                {isRegister ? "Ro‘yxatdan o‘tish" : "Kirish"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowLogin(false)}
            >
              Yopish
            </button>
          </div>
        </div>
      )}  
      {showSellerPanel && user?.role === "seller" && (
        <div className="auth-overlay">
          <div className="auth-box">
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
                <option value="Elektronika">Elektronika</option>
                <option value="Kiyim-kechak">Kiyim-kechak</option>
                <option value="Boshqalar">Boshqalar</option>
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
                    <option value="Elektronika">Elektronika</option>
                    <option value="Kiyim-kechak">Kiyim-kechak</option>
                    <option value="Boshqalar">Boshqalar</option>
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


            <button
              type="button"
              onClick={() => setShowSellerPanel(false)}
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

