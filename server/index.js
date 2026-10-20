import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

if (!process.env.JWT_SECRET) throw new Error('Set JWT_SECRET in server/.env');

const app=express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://minimarket-uz.vercel.app"
  ]
}));
app.use(express.json({limit:'100kb'}));
const wrap=fn=>(req,res,next)=>{try{fn(req,res,next)}catch(e){next(e)}};
const tokenFor=u=>jwt.sign({id:u.id,role:u.role},process.env.JWT_SECRET,{expiresIn:'7d'});
const auth=(role)=>wrap(async (req,res,next)=>{
 const token=(req.headers.authorization||'').replace(/^Bearer /,'');
 let payload;try{payload=jwt.verify(token,process.env.JWT_SECRET)}catch{return res.status(401).json({error:'Tizimga kiring'})}
 const result = await db.query(
    'SELECT id, name, email, role FROM users WHERE id=$1',
    [payload.id]
  );
  const user = result.rows[0];
 if(!user)return res.status(401).json({error:'Foydalanuvchi topilmadi'});
 if(role&&user.role!==role)return res.status(403).json({error:'Ruxsat yo‘q'});
 req.user=user;next();
});
const categories=['Elektronika','Kiyim-kechak','Uy jihozlari','Sport','Boshqalar'];
const validProduct=b=>typeof b.name==='string'&&b.name.trim().length>0&&typeof b.description==='string'&&Number.isSafeInteger(b.price)&&b.price>0&&categories.includes(b.category)&&Number.isSafeInteger(b.stock)&&b.stock>=0&&(!b.image_url||typeof b.image_url==='string');
app.post('/api/auth/register', wrap(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== 'string' || password.length < 8 ||
    !['buyer', 'seller'].includes(role)
  ) {
    return res.status(400).json({ error: 'Maʼlumotlar noto‘g‘ri' });
  }

  const normalized = email.trim().toLowerCase();

  const existing = await db.query(
    'SELECT id FROM users WHERE email=$1',
    [normalized]
  );

  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Email band' });
  }

  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
    [
      name.trim(),
      normalized,
      bcrypt.hashSync(password, 10),
      role
    ]
  );

  const user = result.rows[0];

  res.status(201).json({
    user,
    token: tokenFor(user)
  });
}));
app.post('/api/auth/login', wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const result = await db.query(
    'SELECT * FROM users WHERE email=$1',
    [email]
  );

  const u = result.rows[0];

  if (!u || !bcrypt.compareSync(password, u.password_hash)) {
    return res.status(401).json({
      error: 'Email yoki parol xato'
    });
  }

  const { password_hash, ...user } = u;
-
  res.json({
    user,
    token: tokenFor(user)
  });
}));
app.get('/api/auth/me',auth(),(req,res)=>res.json(req.user));
app.get('/api/categories',(req,res)=>res.json(categories));
app.get('/api/products', wrap(async (req, res) => {
  const {
    search = '',
    category = '',
    min = '',
    max = '',
    sort = 'new'
  } = req.query;

  let sql = `
    SELECT p.*, u.name AS seller_name
    FROM products p
    JOIN users u ON u.id = p.seller_id
    WHERE 1=1
  `;

  const args = [];

  if (search) {
    args.push(`%${search}%`);
    sql += ` AND p.name ILIKE $${args.length}`;
  }

  if (category) {
    args.push(category);
    sql += ` AND p.category = $${args.length}`;
  }

  if (min !== '') {
    args.push(Number(min));
    sql += ` AND p.price >= $${args.length}`;
  }

  if (max !== '') {
    args.push(Number(max));
    sql += ` AND p.price <= $${args.length}`;
  }

  const order = {
    asc: 'p.price ASC',
    desc: 'p.price DESC',
    new: 'p.created_at DESC, p.id DESC'
  };

  sql += ` ORDER BY ${order[sort] || order.new}`;

  const result = await db.query(sql, args);

  res.json(result.rows);
}));
app.get('/api/products/:id', wrap(async (req, res) => {
  const result = await db.query(
    `SELECT p.*, u.name AS seller_name
     FROM products p
     JOIN users u ON u.id = p.seller_id
     WHERE p.id = $1`,
    [req.params.id]
  );

  const product = result.rows[0];

  if (!product) {
    return res.status(404).json({
      error: 'Mahsulot topilmadi'
    });
  }

  res.json(product);
}));
app.get('/api/seller/products', auth('seller'), wrap(async (req, res) => {
  const result = await db.query(
    'SELECT * FROM products WHERE seller_id=$1 ORDER BY id DESC',
    [req.user.id]
  );

  res.json(result.rows);
}));
app.post('/api/products', auth('seller'), wrap(async (req, res) => {
  if (!validProduct(req.body)) {
    return res.status(400).json({ error: 'Mahsulot ma’lumotlari xato' });
  }

  const b = req.body;

  const result = await db.query(
    `INSERT INTO products
      (seller_id, name, description, price, category, image_url, stock)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      req.user.id,
      b.name.trim(),
      b.description,
      b.price,
      b.category,
      b.image_url || '',
      b.stock
    ]
  );

  res.status(201).json({ id: result.rows[0].id });
}));
app.put('/api/products/:id', auth('seller'), wrap(async (req, res) => {
  if (!validProduct(req.body)) {
    return res.status(400).json({
      error: 'Mahsulot ma’lumotlari xato'
    });
  }

  const b = req.body;

  const result = await db.query(
    `UPDATE products
     SET name=$1,
         description=$2,
         price=$3,
         category=$4,
         image_url=$5,
         stock=$6
     WHERE id=$7 AND seller_id=$8
     RETURNING id`,
    [
      b.name.trim(),
      b.description,
      b.price,
      b.category,
      b.image_url || '',
      b.stock,
      req.params.id,
      req.user.id
    ]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: 'Mahsulot topilmadi yoki ruxsat yo‘q'
    });
  }

  res.json({ ok: true });
}));
app.delete('/api/products/:id', auth('seller'), wrap(async (req, res) => {
  const result = await db.query(
    `DELETE FROM products
     WHERE id=$1 AND seller_id=$2
     RETURNING id`,
    [req.params.id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: 'Mahsulot topilmadi yoki ruxsat yo‘q'
    });
  }

  res.json({ ok: true });
}));
const checkout = async (buyer, b) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    let total = 0;
    const lines = [];

    for (const item of b.items) {
      if (
        !Number.isSafeInteger(item.product_id) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        throw Object.assign(new Error('Miqdor xato'), { status: 400 });
      }

      const result = await client.query(
        'SELECT * FROM products WHERE id=$1 FOR UPDATE',
        [item.product_id]
      );

      const p = result.rows[0];

      if (!p || p.stock < item.quantity) {
        throw Object.assign(
          new Error('Mahsulot qolmagan yoki yetarli emas'),
          { status: 409 }
        );
      }

      total += Number(p.price) * item.quantity;

      if (!Number.isSafeInteger(total)) {
        throw Object.assign(new Error('Summa juda katta'), { status: 400 });
      }

      lines.push({ p, quantity: item.quantity });
    }

    const orderResult = await client.query(
      `INSERT INTO orders
       (buyer_id, total_amount, customer_name, phone, address, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        buyer.id,
        total,
        b.customer_name.trim(),
        b.phone.trim(),
        b.address.trim(),
        b.note || ''
      ]
    );

    const orderId = orderResult.rows[0].id;

    for (const { p, quantity } of lines) {
      await client.query(
        'UPDATE products SET stock=stock-$1 WHERE id=$2',
        [quantity, p.id]
      );

      await client.query(
        `INSERT INTO order_items
         (order_id, product_id, seller_id, product_name, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, p.id, p.seller_id, p.name, quantity, p.price]
      );
    }

    await client.query('COMMIT');

    return { id: orderId, total_amount: total };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
app.post('/api/orders', auth('buyer'), wrap(async (req, res) => {
 const b=req.body;
 if(!b||typeof b.customer_name!=='string'||!b.customer_name.trim()||typeof b.phone!=='string'||!b.phone.trim()||typeof b.address!=='string'||!b.address.trim()||!Array.isArray(b.items)||b.items.length===0||b.items.length>100||b.items.some(x=>!x||typeof x!=='object')||new Set(b.items.map(x=>x.product_id)).size!==b.items.length|| (b.note!=null&&typeof b.note!=='string'))return res.status(400).json({error:'Buyurtma ma’lumotlari xato'});
 const result = await checkout(req.user, b);
res.status(201).json(result);
}));
app.get('/api/orders/mine', auth('buyer'), wrap(async (req, res) => {
  const ordersResult = await db.query(
    'SELECT * FROM orders WHERE buyer_id=$1 ORDER BY id DESC',
    [req.user.id]
  );

  const orders = [];

  for (const order of ordersResult.rows) {
    const itemsResult = await db.query(
      `SELECT id, order_id, product_id, product_name,
              quantity, unit_price, status
       FROM order_items
       WHERE order_id=$1`,
      [order.id]
    );

    orders.push({
      ...order,
      items: itemsResult.rows
    });
  }

  res.json(orders);
}));
app.get('/api/seller/orders', auth('seller'), wrap(async (req, res) => {
  const result = await db.query(
    `SELECT
       oi.id AS item_id,
       oi.order_id,
       oi.product_name,
       oi.quantity,
       oi.unit_price,
       oi.status,
       o.customer_name,
       o.phone,
       o.address,
       o.created_at
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.seller_id = $1
     ORDER BY oi.id DESC`,
    [req.user.id]
  );

  res.json(result.rows);
}));
app.patch(
  '/api/seller/orders/:itemId',
  auth('seller'),
  wrap(async (req, res) => {
    const { status } = req.body;

    if (!['Yangi', 'Jarayonda', 'Yetkazilgan'].includes(status)) {
      return res.status(400).json({
        error: 'Holat xato'
      });
    }

    const result = await db.query(
      `UPDATE order_items
       SET status = $1
       WHERE id = $2 AND seller_id = $3
       RETURNING id`,
      [status, req.params.itemId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Buyurtma qismi topilmadi'
      });
    }

    res.json({ ok: true });
  })
);
app.use((err,req,res,next)=>{console.error(err);res.status(err.status||500).json({error:err.status?err.message:'Server xatosi'})});
app.listen(Number(process.env.PORT)||4000,()=>console.log('API http://localhost:'+(process.env.PORT||4000)));
