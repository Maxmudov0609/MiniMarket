import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';

if (!process.env.JWT_SECRET) throw new Error('Set JWT_SECRET in server/.env');
const db = new Database('minimarket.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('buyer','seller')),created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY,seller_id INTEGER NOT NULL REFERENCES users(id),name TEXT NOT NULL,description TEXT NOT NULL,price INTEGER NOT NULL CHECK(price>0),category TEXT NOT NULL,image_url TEXT NOT NULL DEFAULT '',stock INTEGER NOT NULL CHECK(stock>=0),created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY,buyer_id INTEGER NOT NULL REFERENCES users(id),total_amount INTEGER NOT NULL,customer_name TEXT NOT NULL,phone TEXT NOT NULL,address TEXT NOT NULL,note TEXT DEFAULT '',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS order_items(id INTEGER PRIMARY KEY,order_id INTEGER NOT NULL REFERENCES orders(id),product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,seller_id INTEGER NOT NULL REFERENCES users(id),product_name TEXT NOT NULL,quantity INTEGER NOT NULL,unit_price INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'Yangi' CHECK(status IN ('Yangi','Jarayonda','Yetkazilgan')));
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id);
`);
const app=express();
app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'}));
app.use(express.json({limit:'100kb'}));
const wrap=fn=>(req,res,next)=>{try{fn(req,res,next)}catch(e){next(e)}};
const tokenFor=u=>jwt.sign({id:u.id,role:u.role},process.env.JWT_SECRET,{expiresIn:'7d'});
const auth=(role)=>wrap((req,res,next)=>{
 const token=(req.headers.authorization||'').replace(/^Bearer /,'');
 let payload;try{payload=jwt.verify(token,process.env.JWT_SECRET)}catch{return res.status(401).json({error:'Tizimga kiring'})}
 const user=db.prepare('SELECT id,name,email,role FROM users WHERE id=?').get(payload.id);
 if(!user)return res.status(401).json({error:'Foydalanuvchi topilmadi'});
 if(role&&user.role!==role)return res.status(403).json({error:'Ruxsat yo‘q'});
 req.user=user;next();
});
const categories=['Elektronika','Kiyim-kechak','Uy jihozlari','Sport','Boshqalar'];
const validProduct=b=>typeof b.name==='string'&&b.name.trim().length>0&&typeof b.description==='string'&&Number.isSafeInteger(b.price)&&b.price>0&&categories.includes(b.category)&&Number.isSafeInteger(b.stock)&&b.stock>=0&&(!b.image_url||typeof b.image_url==='string');
app.post('/api/auth/register',wrap((req,res)=>{
 const {name,email,password,role}=req.body;
 if(typeof name!=='string'||!name.trim()||typeof email!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof password!=='string'||password.length<8||!['buyer','seller'].includes(role))return res.status(400).json({error:'Ma’lumotlarni tekshiring (parol kamida 8 belgi)'});
 const normalized=email.trim().toLowerCase();
 if(db.prepare('SELECT id FROM users WHERE email=?').get(normalized))return res.status(409).json({error:'Email band'});
 const info=db.prepare('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)').run(name.trim(),normalized,bcrypt.hashSync(password,10),role);
 const user=db.prepare('SELECT id,name,email,role FROM users WHERE id=?').get(info.lastInsertRowid);
 res.status(201).json({user,token:tokenFor(user)});
}));
app.post('/api/auth/login',wrap((req,res)=>{
 const u=db.prepare('SELECT * FROM users WHERE email=?').get(String(req.body.email||'').trim().toLowerCase());
 if(!u||!bcrypt.compareSync(String(req.body.password||''),u.password_hash))return res.status(401).json({error:'Email yoki parol xato'});
 const {password_hash,...user}=u;res.json({user,token:tokenFor(user)});
}));
app.get('/api/auth/me',auth(),(req,res)=>res.json(req.user));
app.get('/api/categories',(req,res)=>res.json(categories));
app.get('/api/products',wrap((req,res)=>{
 const {search='',category='',min='',max='',sort='new'}=req.query;
 let sql='SELECT p.*,u.name AS seller_name FROM products p JOIN users u ON u.id=p.seller_id WHERE 1=1',args=[];
 if(search){sql+=' AND p.name LIKE ?';args.push('%'+String(search)+'%')}
 if(category){sql+=' AND p.category=?';args.push(category)}
 if(min!==''){sql+=' AND p.price>=?';args.push(Number(min))}
 if(max!==''){sql+=' AND p.price<=?';args.push(Number(max))}
 sql+=' ORDER BY '+({asc:'p.price ASC',desc:'p.price DESC',new:'p.created_at DESC,p.id DESC'}[sort]||'p.id DESC');
 res.json(db.prepare(sql).all(...args));
}));
app.get('/api/products/:id',wrap((req,res)=>{
 const p=db.prepare('SELECT p.*,u.name seller_name FROM products p JOIN users u ON u.id=p.seller_id WHERE p.id=?').get(req.params.id);
 if(!p)return res.status(404).json({error:'Mahsulot topilmadi'});res.json(p);
}));
app.get('/api/seller/products',auth('seller'),wrap((req,res)=>res.json(db.prepare('SELECT * FROM products WHERE seller_id=? ORDER BY id DESC').all(req.user.id))));
app.post('/api/products',auth('seller'),wrap((req,res)=>{
 if(!validProduct(req.body))return res.status(400).json({error:'Mahsulot ma’lumotlari xato'});
 const b=req.body;
 const info=db.prepare('INSERT INTO products(seller_id,name,description,price,category,image_url,stock) VALUES(?,?,?,?,?,?,?)').run(req.user.id,b.name.trim(),b.description,b.price,b.category,b.image_url||'',b.stock);
 res.status(201).json({id:info.lastInsertRowid});
}));
app.put('/api/products/:id',auth('seller'),wrap((req,res)=>{
 if(!validProduct(req.body))return res.status(400).json({error:'Mahsulot ma’lumotlari xato'});
 const b=req.body;
 const result=db.prepare('UPDATE products SET name=?,description=?,price=?,category=?,image_url=?,stock=? WHERE id=? AND seller_id=?').run(b.name.trim(),b.description,b.price,b.category,b.image_url||'',b.stock,req.params.id,req.user.id);
 if(!result.changes)return res.status(404).json({error:'Mahsulot topilmadi yoki ruxsat yo‘q'});res.json({ok:true});
}));
app.delete('/api/products/:id',auth('seller'),wrap((req,res)=>{
 const result=db.prepare('DELETE FROM products WHERE id=? AND seller_id=?').run(req.params.id,req.user.id);
 if(!result.changes)return res.status(404).json({error:'Mahsulot topilmadi yoki ruxsat yo‘q'});res.json({ok:true});
}));
const checkout=db.transaction((buyer,b)=>{
 let total=0;
 const lines=[];
 for(const item of b.items){
  if(!Number.isSafeInteger(item.product_id)||!Number.isSafeInteger(item.quantity)||item.quantity<1)throw Object.assign(new Error('Miqdor xato'),{status:400});
  const p=db.prepare('SELECT * FROM products WHERE id=?').get(item.product_id);
  if(!p||p.stock<item.quantity)throw Object.assign(new Error('Mahsulot qolmagan yoki yetarli emas'),{status:409});
  total+=p.price*item.quantity;
  if(!Number.isSafeInteger(total))throw Object.assign(new Error('Summa juda katta'),{status:400});
  lines.push({p,quantity:item.quantity});
 }
 const order=db.prepare('INSERT INTO orders(buyer_id,total_amount,customer_name,phone,address,note) VALUES(?,?,?,?,?,?)').run(buyer.id,total,b.customer_name.trim(),b.phone.trim(),b.address.trim(),b.note||'');
 for(const {p,quantity} of lines){
  db.prepare('UPDATE products SET stock=stock-? WHERE id=?').run(quantity,p.id);
  db.prepare('INSERT INTO order_items(order_id,product_id,seller_id,product_name,quantity,unit_price) VALUES(?,?,?,?,?,?)').run(order.lastInsertRowid,p.id,p.seller_id,p.name,quantity,p.price);
 }
 return {id:order.lastInsertRowid,total_amount:total};
});
app.post('/api/orders',auth('buyer'),wrap((req,res)=>{
 const b=req.body;
 if(!b||typeof b.customer_name!=='string'||!b.customer_name.trim()||typeof b.phone!=='string'||!b.phone.trim()||typeof b.address!=='string'||!b.address.trim()||!Array.isArray(b.items)||b.items.length===0||b.items.length>100||b.items.some(x=>!x||typeof x!=='object')||new Set(b.items.map(x=>x.product_id)).size!==b.items.length|| (b.note!=null&&typeof b.note!=='string'))return res.status(400).json({error:'Buyurtma ma’lumotlari xato'});
 res.status(201).json(checkout(req.user,b));
}));
app.get('/api/orders/mine',auth('buyer'),wrap((req,res)=>{
 const orders=db.prepare('SELECT * FROM orders WHERE buyer_id=? ORDER BY id DESC').all(req.user.id);
 const items=db.prepare('SELECT id,order_id,product_id,product_name,quantity,unit_price,status FROM order_items WHERE order_id=?');
 res.json(orders.map(o=>({...o,items:items.all(o.id)})));
}));
app.get('/api/seller/orders',auth('seller'),wrap((req,res)=>{
 res.json(db.prepare(`SELECT oi.id item_id,oi.order_id,oi.product_name,oi.quantity,oi.unit_price,oi.status,o.customer_name,o.phone,o.address,o.created_at FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE oi.seller_id=? ORDER BY oi.id DESC`).all(req.user.id));
}));
app.patch('/api/seller/orders/:itemId',auth('seller'),wrap((req,res)=>{
 if(!['Yangi','Jarayonda','Yetkazilgan'].includes(req.body.status))return res.status(400).json({error:'Holat xato'});
 const result=db.prepare('UPDATE order_items SET status=? WHERE id=? AND seller_id=?').run(req.body.status,req.params.itemId,req.user.id);
 if(!result.changes)return res.status(404).json({error:'Buyurtma qismi topilmadi'});res.json({ok:true});
}));
app.use((err,req,res,next)=>{console.error(err);res.status(err.status||500).json({error:err.status?err.message:'Server xatosi'})});
app.listen(Number(process.env.PORT)||4000,()=>console.log('API http://localhost:'+(process.env.PORT||4000)));
