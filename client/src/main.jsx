import React,{useState,useEffect,createContext,useContext} from 'react';
import{createRoot}from'react-dom/client';
import{BrowserRouter,Link,useNavigate,useParams,Routes,Route,Navigate}from'react-router-dom';
import './style.css';
const Context=createContext(null);
const cats=['Elektronika','Kiyim-kechak','Uy jihozlari','Sport','Boshqalar'];
const money=n=>Number(n).toLocaleString('uz-UZ')+' so‘m';
async function api(path,options={}){
 const token=localStorage.getItem('token');
 const response=await fetch('/api'+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...options.headers}});
 const data=await response.json();
 if(!response.ok)throw Error(data.error||'Xatolik yuz berdi');
 return data;
}
function Provider({children}){
 const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('user'))}catch{return null}});
 const [cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem('cart'))||[]}catch{return []}});
 useEffect(()=>localStorage.setItem('cart',JSON.stringify(cart)),[cart]);
 useEffect(()=>{if(localStorage.getItem('token'))api('/auth/me').then(u=>{setUser(u);localStorage.setItem('user',JSON.stringify(u))}).catch(()=>{localStorage.removeItem('token');localStorage.removeItem('user');setUser(null)})},[]);
 const login=data=>{localStorage.setItem('token',data.token);localStorage.setItem('user',JSON.stringify(data.user));setUser(data.user)};
 const logout=()=>{localStorage.removeItem('token');localStorage.removeItem('user');setUser(null);setCart([])};
 const add=p=>{if(p.stock<1)return;setCart(old=>{const item=old.find(i=>i.id===p.id);return item?old.map(i=>i.id===p.id?{...i,quantity:Math.min(p.stock,i.quantity+1)}:i):[...old,{...p,quantity:1}]})};
 return <Context.Provider value={{user,cart,setCart,login,logout,add}}>{children}</Context.Provider>;
}
const useApp=()=>useContext(Context);
function Layout({children}){
 const {user,cart,logout}=useApp();
 return <><header><Link to="/" className="logo">🛍 MiniMarket</Link><nav><Link to="/">Mahsulotlar</Link>{user?.role==='buyer'&&<><Link to="/cart">Savatcha ({cart.reduce((s,i)=>s+i.quantity,0)})</Link><Link to="/orders">Buyurtmalarim</Link></>}{user?.role==='seller'&&<Link to="/seller">Sotuvchi kabineti</Link>}{user?<><span>{user.name}</span><button onClick={logout}>Chiqish</button></>:<Link to="/auth">Kirish / Ro‘yxatdan o‘tish</Link>}</nav></header><main>{children}</main><footer>MiniMarket • Demo loyiha • Haqiqiy to‘lov yo‘q</footer></>;
}
function Require({role,children}){const {user}=useApp();return user?.role===role?children:<Navigate to="/auth"/>}
function ProductCard({p}){const {add,user}=useApp();return <article className="card"><Link to={'/product/'+p.id}><img src={p.image_url||'https://placehold.co/600x400?text=MiniMarket'} alt={p.name}/><h3>{p.name}</h3></Link><p>{p.category}</p><strong>{money(p.price)}</strong><p>Qoldiq: {p.stock}</p><button disabled={!p.stock||user?.role==='seller'} onClick={()=>add(p)}>{p.stock?'Savatchaga qo‘shish':'Sotuvda yo‘q'}</button></article>}
function Home(){
 const [products,setProducts]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [filters,setFilters]=useState({search:'',category:'',min:'',max:'',sort:'new'});
 useEffect(()=>{let active=true;setLoading(true);setError('');api('/products?'+new URLSearchParams(Object.entries(filters).filter(([,v])=>v!==''))).then(d=>{if(active)setProducts(d)}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[filters]);
 const update=e=>setFilters(f=>({...f,[e.target.name]:e.target.value}));
 return <><h1>Mahsulotlar</h1><div className="filters"><input name="search" placeholder="Mahsulot qidirish..." value={filters.search} onChange={update}/><select name="category" value={filters.category} onChange={update}><option value="">Barcha kategoriyalar</option>{cats.map(c=><option key={c}>{c}</option>)}</select><input name="min" type="number" min="0" placeholder="Min narx" value={filters.min} onChange={update}/><input name="max" type="number" min="0" placeholder="Max narx" value={filters.max} onChange={update}/><select name="sort" value={filters.sort} onChange={update}><option value="new">Eng yangi</option><option value="asc">Arzonidan qimmatiga</option><option value="desc">Qimmatidan arzoniga</option></select></div>{loading?<p>Yuklanmoqda...</p>:error?<p className="error">{error}</p>:products.length?<div className="grid">{products.map(p=><ProductCard key={p.id} p={p}/>)}</div>:<p>Mahsulotlar topilmadi.</p>}</>;
}
function Detail(){
 const {id}=useParams(),[p,setP]=useState(null),[error,setError]=useState('');
 const {add,user}=useApp();
 useEffect(()=>{api('/products/'+id).then(setP).catch(e=>setError(e.message))},[id]);
 if(error)return <p className="error">{error}</p>;if(!p)return <p>Yuklanmoqda...</p>;
 return <div className="detail"><img src={p.image_url||'https://placehold.co/600x400?text=MiniMarket'} alt={p.name}/><section><h1>{p.name}</h1><p>{p.description}</p><h2>{money(p.price)}</h2><p>Kategoriya: {p.category}</p><p>Sotuvchi: {p.seller_name}</p><p>Qoldiq: {p.stock}</p><button disabled={!p.stock||user?.role==='seller'} onClick={()=>add(p)}>{p.stock?'Savatchaga qo‘shish':'Sotuvda yo‘q'}</button></section></div>;
}
function Auth(){
 const [register,setRegister]=useState(false),[form,setForm]=useState({name:'',email:'',password:'',role:'buyer'}),[error,setError]=useState('');
 const {login}=useApp(),navigate=useNavigate();
 const submit=async e=>{e.preventDefault();setError('');try{const data=await api('/auth/'+(register?'register':'login'),{method:'POST',body:JSON.stringify(form)});login(data);navigate(data.user.role==='seller'?'/seller':'/')}catch(err){setError(err.message)}};
 return <div className="panel narrow"><h1>{register?'Ro‘yxatdan o‘tish':'Tizimga kirish'}</h1><form onSubmit={submit}>{register&&<><label>Ism</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></>}<label>Email</label><input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><label>Parol</label><input type="password" minLength={register?8:1} required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>{register&&<><label>Foydalanuvchi turi</label><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="buyer">Xaridor</option><option value="seller">Sotuvchi</option></select></>}{error&&<p className="error">{error}</p>}<button>{register?'Ro‘yxatdan o‘tish':'Kirish'}</button></form><button className="linkbtn" onClick={()=>{setRegister(!register);setError('')}}>{register?'Akkaunt bormi? Kirish':'Akkaunt yo‘qmi? Ro‘yxatdan o‘tish'}</button></div>;
}
function Cart(){
 const {cart,setCart,user}=useApp(),navigate=useNavigate();
 const [error,setError]=useState('');
 useEffect(()=>{if(cart.length)Promise.all(cart.map(i=>api('/products/'+i.id))).then(products=>setCart(old=>old.filter(i=>products.some(p=>p.id===i.id)).map(i=>{const p=products.find(p=>p.id===i.id);return {...i,price:p.price,stock:p.stock,quantity:Math.min(i.quantity,p.stock)}}).filter(i=>i.quantity>0))).catch(e=>setError(e.message))},[]);
 const qty=(id,delta)=>setCart(old=>old.map(i=>i.id===id?{...i,quantity:Math.max(1,Math.min(i.stock,i.quantity+delta))}:i));
 return <><h1>Savatcha</h1>{error&&<p className="error">{error}</p>}{cart.length===0?<p>Savatcha bo‘sh.</p>:<><div className="panel">{cart.map(i=><div className="cartrow" key={i.id}><img src={i.image_url||'https://placehold.co/100x100?text=Item'} alt={i.name}/><div><strong>{i.name}</strong><p>{money(i.price)} × {i.quantity} = {money(i.price*i.quantity)}</p><button onClick={()=>qty(i.id,-1)}>−</button> {i.quantity} <button onClick={()=>qty(i.id,1)}>+</button> <button className="danger" onClick={()=>setCart(old=>old.filter(x=>x.id!==i.id))}>Olib tashlash</button></div></div>)}</div><h2>Jami: {money(cart.reduce((s,i)=>s+i.price*i.quantity,0))}</h2><button onClick={()=>navigate(user?.role==='buyer'?'/checkout':'/auth')}>Buyurtma berish</button></>}</>;
}
function Checkout(){
 const {cart,setCart}=useApp(),navigate=useNavigate();
 const [form,setForm]=useState({customer_name:'',phone:'',address:'',note:''}),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{const r=await api('/orders',{method:'POST',body:JSON.stringify({...form,items:cart.map(i=>({product_id:i.id,quantity:i.quantity}))})});setCart([]);alert('Buyurtma #'+r.id+' muvaffaqiyatli yaratildi!');navigate('/orders')}catch(e){setError(e.message)}finally{setBusy(false)}};
 if(!cart.length)return <p>Savatcha bo‘sh. <Link to="/">Mahsulotlarga qaytish</Link></p>;
 return <div className="panel narrow"><h1>Buyurtma berish</h1><p>To‘lov test rejimida.</p><form onSubmit={submit}>{[['customer_name','Ism'],['phone','Telefon'],['address','Yetkazib berish manzili'],['note','Izoh (ixtiyoriy)']].map(([key,label])=><React.Fragment key={key}><label>{label}</label><input required={key!=='note'} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></React.Fragment>)}{error&&<p className="error">{error}</p>}<button disabled={busy}>{busy?'Saqlanmoqda...':'Buyurtmani tasdiqlash'}</button></form></div>;
}
function Orders(){
 const [orders,setOrders]=useState([]),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{api('/orders/mine').then(setOrders).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 return <><h1>Mening buyurtmalarim</h1>{loading?<p>Yuklanmoqda...</p>:error?<p className="error">{error}</p>:!orders.length?<p>Buyurtmalar yo‘q.</p>:orders.map(o=><div className="panel" key={o.id}><h3>Buyurtma #{o.id} • {o.created_at}</h3>{o.items.map(i=><p key={i.id}>{i.product_name} — {i.quantity} × {money(i.unit_price)} — <b>{i.status}</b></p>)}<strong>Jami: {money(o.total_amount)}</strong></div>)}</>;
}
const blank={name:'',description:'',price:1,category:cats[0],image_url:'',stock:0};
function Seller(){
 const [products,setProducts]=useState([]),[orders,setOrders]=useState([]),[form,setForm]=useState(blank),[editing,setEditing]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[loading,setLoading]=useState(true);
 const refresh=async()=>{const [p,o]=await Promise.all([api('/seller/products'),api('/seller/orders')]);setProducts(p);setOrders(o)};
 useEffect(()=>{refresh().catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 const submit=async e=>{e.preventDefault();setError('');setNotice('');try{await api('/products'+(editing?'/'+editing:''),{method:editing?'PUT':'POST',body:JSON.stringify({...form,price:Number(form.price),stock:Number(form.stock)})});setForm(blank);setEditing(null);await refresh();setNotice('Mahsulot saqlandi')}catch(e){setError(e.message)}};
 const remove=async id=>{if(!confirm('Mahsulot o‘chirilsinmi?'))return;try{await api('/products/'+id,{method:'DELETE'});await refresh()}catch(e){setError(e.message)}};
 const change=async(id,status)=>{try{await api('/seller/orders/'+id,{method:'PATCH',body:JSON.stringify({status})});await refresh()}catch(e){setError(e.message)}};
 return <><h1>Sotuvchi kabineti</h1>{error&&<p className="error">{error}</p>}{notice&&<p className="success">{notice}</p>}<div className="panel"><h2>{editing?'Mahsulotni tahrirlash':'Yangi mahsulot qo‘shish'}</h2><form onSubmit={submit} className="productform">{[['name','Nomi'],['description','Tavsifi'],['price','Narxi (UZS)'],['image_url','Rasm URL'],['stock','Miqdori']].map(([key,label])=><label key={key}>{label}<input required={key!=='image_url'} type={['price','stock'].includes(key)?'number':'text'} min={key==='price'?1:key==='stock'?0:undefined} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}<label>Kategoriya<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{cats.map(c=><option key={c}>{c}</option>)}</select></label><button>Saqlash</button>{editing&&<button type="button" onClick={()=>{setEditing(null);setForm(blank)}}>Bekor qilish</button>}</form></div><h2>Mening mahsulotlarim</h2>{loading?<p>Yuklanmoqda...</p>:!products.length?<p>Mahsulot yo‘q.</p>:<div className="panel">{products.map(p=><div className="line" key={p.id}><span>{p.name} — {money(p.price)} — {p.stock} dona</span><div><button onClick={()=>{setEditing(p.id);setForm({name:p.name,description:p.description,price:p.price,category:p.category,image_url:p.image_url,stock:p.stock});window.scrollTo(0,0)}}>Tahrirlash</button> <button className="danger" onClick={()=>remove(p.id)}>O‘chirish</button></div></div>)}</div>}<h2>Kelgan buyurtmalar</h2>{!orders.length?<p>Buyurtmalar yo‘q.</p>:<div className="panel">{orders.map(o=><div className="line" key={o.item_id}><div><b>#{o.order_id} — {o.product_name}</b><p>{o.customer_name} • {o.phone} • {o.address}</p><p>{o.quantity} × {money(o.unit_price)} • {o.created_at}</p></div><select value={o.status} onChange={e=>change(o.item_id,e.target.value)}>{['Yangi','Jarayonda','Yetkazilgan'].map(s=><option key={s}>{s}</option>)}</select></div>)}</div>}</>;
}
function App(){return <Provider><BrowserRouter><Layout><Routes><Route path="/" element={<Home/>}/><Route path="/product/:id" element={<Detail/>}/><Route path="/auth" element={<Auth/>}/><Route path="/cart" element={<Cart/>}/><Route path="/checkout" element={<Require role="buyer"><Checkout/></Require>}/><Route path="/orders" element={<Require role="buyer"><Orders/></Require>}/><Route path="/seller" element={<Require role="seller"><Seller/></Require>}/><Route path="*" element={<Navigate to="/"/>}/></Routes></Layout></BrowserRouter></Provider>}
createRoot(document.getElementById('root')).render(<App/>);
