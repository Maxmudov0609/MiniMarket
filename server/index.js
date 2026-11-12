import 'dotenv/config';
import express from 'express';
import { createHash } from 'node:crypto';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { rateLimit } from 'express-rate-limit';
import { db } from './db.js';

if (!process.env.JWT_SECRET) throw new Error('Set JWT_SECRET in server/.env');

const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://minimarket-uz.vercel.app",
    "https://mini-market-git-design-premium-refresh-2026-11-maxmudov0609.vercel.app",
    "https://market-mj.uz",
    "https://www.market-mj.uz"
  ]
}));
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
app.get('/api/db-check', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT current_database() AS database_name,
             current_schema() AS schema_name,
             current_user AS database_user,
             EXISTS (
               SELECT 1
               FROM information_schema.columns
               WHERE table_schema = 'public'
                 AND table_name = 'orders'
                 AND column_name = 'customer_name'
             ) AS has_customer_name
    `);

    res.json(result.rows[0]);
} catch (error) {
  console.error("DATABASE XATOSI:", error.message);
  res.status(500).json({ error: "Database tekshiruvda xatolik" });
}
});

app.use(express.json({limit:'100kb'}));
const wrap = fn => (req, res, next) => {
  Promise.resolve().then(() => fn(req, res, next)).catch(next);
};
// Additive, idempotent schema updates; preserve all existing orders and products.
let deliverySchemaPromise;
function deliverySchema() {
  if (!deliverySchemaPromise) deliverySchemaPromise = db.query(
    'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMPTZ'
  ).catch(error => { deliverySchemaPromise = null; throw error; });
  return deliverySchemaPromise;
}
let photoSchemaPromise;
function photoSchema() {
  if (!photoSchemaPromise) photoSchemaPromise = db.query(
    'CREATE TABLE IF NOT EXISTS product_images (' +
    'product_id BIGINT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,' +
    'mime_type VARCHAR(32) NOT NULL, content BYTEA NOT NULL,' +
    'updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())'
  ).catch(error => { photoSchemaPromise = null; throw error; });
  return photoSchemaPromise;
}
const photoLimiter = rateLimit({windowMs:60*60*1000,limit:35,standardHeaders:'draft-8',legacyHeaders:false,
  message:{error:'Rasm yuklash limiti tugadi. Keyinroq urinib ko‘ring.'}});
function validImageBytes(data, type) {
  if (!Buffer.isBuffer(data) || data.length < 24 || data.length > 1500000) return false;
  if (type === 'image/jpeg') return data[0]===0xff && data[1]===0xd8 && data[2]===0xff &&
    data[data.length-2]===0xff && data[data.length-1]===0xd9;
  if (type === 'image/png') return data.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'));
  if (type === 'image/webp') return data.toString('ascii',0,4)==='RIFF' && data.toString('ascii',8,12)==='WEBP';
  return false;
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: "Juda ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring." }
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: "Ro'yxatdan o'tish uchun juda ko'p urinish. Keyinroq qayta urinib ko'ring." }
});
const tokenFor=u=>jwt.sign({id:u.id,role:u.role},process.env.JWT_SECRET,{expiresIn:'7d'});
const auth = (role) => wrap(async (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/, '');

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Tizimga kiring' });
  }

  const result = await db.query(
    'SELECT id, name, email, role FROM users WHERE id=$1',
    [payload.id]
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
  }

  if (role && user.role !== role && user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo‘q' });
  }

  req.user = user;
  next();
});
const categories = [
  "Ichimliklar",
  "Oziq-ovqat mahsulotlari",
  "Shirinliklar",
  "Maishiy kimyo",
  "Gigiyena vositalari",
  "Bolalar uchun",
  "Uy-ro‘zg‘or",
  "Elektronika",
  "Kiyim-kechak",
  "Uy jihozlari",
  "Sport",
  "Boshqalar"
];
const validProduct = b =>
  b && typeof b === 'object' && typeof b.name === 'string' &&
  b.name.trim().length > 0 && b.name.trim().length <= 180 &&
  typeof b.description === 'string' && b.description.trim().length <= 4000 &&
  Number.isSafeInteger(b.price) && b.price > 0 &&
  categories.includes(b.category) &&
  Number.isSafeInteger(b.stock) && b.stock >= 0 &&
  (!b.image_url || (
    typeof b.image_url === 'string' && b.image_url.length <= 2048 &&
    (/^https?:\/\//i.test(b.image_url) || /^\/(?!\/)[\w./-]+$/.test(b.image_url))
  ));
app.post('/api/auth/register', registerLimiter, wrap(async (req, res) => {
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
app.post('/api/auth/login', loginLimiter, wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const result = await db.query(
    'SELECT * FROM users WHERE email=$1',
    [email]
  );

  const u = result.rows[0];

  if (!u || !u.password_hash || !bcrypt.compareSync(password, u.password_hash)) {
    return res.status(401).json({
      error: 'Email yoki parol xato'
    });
  }

  const { password_hash, google_id, ...user } = u;

  res.json({
    user,
    token: tokenFor(user)
  });
}));
app.post('/api/auth/google', loginLimiter, wrap(async (req, res) => {
  const { credential } = req.body;

  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ error: 'Google token yuborilmadi' });
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch {
    return res.status(401).json({ error: 'Google tasdiqlash tokeni yaroqsiz yoki muddati tugagan' });
  }

  const payload = ticket.getPayload();

  if (!payload?.email_verified || !payload?.email || !payload?.sub) {
    return res.status(401).json({ error: 'Google akkaunti tasdiqlanmadi' });
  }

  const email = payload.email.trim().toLowerCase();
  const googleId = payload.sub;
  const name = payload.name || email.split('@')[0];

  const existing = await db.query(
    'SELECT * FROM users WHERE google_id = $1',
    [googleId]
  );

  let user;

  if (existing.rows.length > 0) {
    user = existing.rows[0];
  } else {
    const byEmail = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (byEmail.rows.length > 0) {
      return res.status(409).json({
        error: 'Bu email bilan akkaunt mavjud. Avval email va parol orqali kiring.'
      });
    }

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role, google_id)
       VALUES ($1, $2, NULL, 'buyer', $3)
       RETURNING id, name, email, role`,
      [name, email, googleId]
    );

    user = result.rows[0];
  }

  const { password_hash, google_id, ...safeUser } = user;

  res.json({
    user: safeUser,
    token: tokenFor(safeUser)
  });
}));
// A Google identity can be linked only from an already authenticated account.
// Matching a verified email is not sufficient to bypass password authentication.
app.post('/api/auth/google/link', loginLimiter, auth(), wrap(async (req, res) => {
  const credential = req.body?.credential;
  if (typeof credential !== 'string' || !credential) {
    return res.status(400).json({ error: 'Google tasdiqlash tokeni yuborilmadi' });
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
  } catch {
    return res.status(401).json({ error: 'Google tasdiqlash tokeni yaroqsiz' });
  }
  const payload = ticket.getPayload();
  if (!payload?.email_verified || !payload?.sub || !payload?.email) {
    return res.status(401).json({ error: 'Google email tasdiqlanmagan' });
  }
  if (payload.email.trim().toLowerCase() !== req.user.email.trim().toLowerCase()) {
    return res.status(403).json({ error: 'Google email hozirgi akkaunt emailiga mos emas' });
  }

  // The unique google_id index blocks links to other users even during races.
  const result = await db.query(
    `UPDATE users SET google_id = $1
     WHERE id = $2 AND email = $3
       AND (google_id IS NULL OR google_id = $1)
       AND NOT EXISTS (SELECT 1 FROM users WHERE google_id = $1 AND id <> $2)
     RETURNING id, name, email, role`,
    [payload.sub, req.user.id, req.user.email]
  );
  if (!result.rows.length) {
    return res.status(409).json({ error: 'Bu Google akkaunti boshqa hisobga bog‘langan yoki boshqa Google allaqachon bog‘langan' });
  }
  res.json({ linked: true, user: result.rows[0] });
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
    WHERE p.is_active = TRUE
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

  const startTime = performance.now();

const result = await db.query(sql, args);

const duration = performance.now() - startTime;

console.log(
  `[PERFORMANCE] /api/products: ${duration.toFixed(2)} ms, mahsulotlar: ${result.rows.length}`
);

  res.set('Cache-Control', 'public, max-age=10, s-maxage=20, stale-while-revalidate=45');
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
  const discount = Number(b.discount_percent ?? 0);

if (
  !Number.isFinite(discount) ||
  discount < 0 ||
  discount > 100
) {
  return res.status(400).json({
    error: "Chegirma 0 dan 100 gacha bo'lishi kerak"
  });
}

const oldPrice =
  b.old_price === undefined ||
  b.old_price === null ||
  b.old_price === ''
    ? null
    : Number(b.old_price);

if (
  (oldPrice !== null &&
    (!Number.isFinite(oldPrice) || oldPrice <= 0)) ||
  (discount > 0 &&
    (oldPrice === null || oldPrice <= Number(b.price)))
) {
  return res.status(400).json({
    error: "Chegirma uchun eski narx yangi narxdan katta bo'lishi kerak"
  });
}

const result = await db.query(
  `UPDATE products
   SET name=$1,
       description=$2,
       price=$3,
       category=$4,
       image_url=$5,
       stock=$6,
       old_price=$7,
       discount_percent=$8
   WHERE id=$9 AND seller_id=$10
   RETURNING id`,
[
  b.name.trim(),
  b.description,
  b.price,
  b.category,
  b.image_url || '',
  b.stock,
  b.old_price === undefined || b.old_price === null || b.old_price === ''
    ? null
    : Number(b.old_price),
  Number(b.discount_percent ?? 0),
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
  const isAdmin = req.user.role === 'admin';

  const result = await db.query(
    `UPDATE products
     SET is_active = false
     WHERE id = $1
       AND is_active = true
       AND ($3::boolean = true OR seller_id = $2)
     RETURNING id`,
    [req.params.id, req.user.id, isAdmin]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: "Mahsulot topilmadi yoki o'chirishga ruxsat yo'q"
    });
  }

  res.json({
    ok: true,
    message: "Mahsulot muvaffaqiyatli o'chirildi"
  });
}));

// Product photos live on the same origin. No fragile hotlinks or extra credentials.
app.put('/api/seller/products/:id/image', auth('seller'), photoLimiter,
  express.raw({type:['image/jpeg','image/png','image/webp'],limit:'1500kb'}),
  wrap(async (req,res) => {
    const productId=Number(req.params.id);
    if (!Number.isSafeInteger(productId) || productId < 1) return res.status(400).json({error:'Mahsulot identifikatori xato'});
    const mime=String(req.headers['content-type'] || '').split(';')[0].toLowerCase();
    if (!validImageBytes(req.body,mime)) return res.status(415).json({error:'JPEG, PNG yoki WebP rasm yuboring (1.5 MB gacha)'});
    const owner=await db.query(
      'SELECT id FROM products WHERE id=$1 AND (seller_id=$2 OR $3::boolean=TRUE) AND is_active=TRUE',
      [productId,req.user.id,req.user.role==='admin']);
    if (!owner.rows.length) return res.status(404).json({error:'Mahsulot topilmadi yoki sizga tegishli emas'});
    await photoSchema();
    const client=await db.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'INSERT INTO product_images(product_id,mime_type,content,updated_at) VALUES ($1,$2,$3,NOW()) ' +
        'ON CONFLICT(product_id) DO UPDATE SET mime_type=EXCLUDED.mime_type,content=EXCLUDED.content,updated_at=NOW()',
        [productId,mime,req.body]);
      const imageUrl='/api/product-images/'+productId;
      await client.query('UPDATE products SET image_url=$1 WHERE id=$2',[imageUrl,productId]);
      await client.query('COMMIT');
      res.json({ok:true,image_url:imageUrl});
    } catch(error) {await client.query('ROLLBACK');throw error;}
    finally {client.release();}
  })
);
app.get('/api/product-images/:id', wrap(async(req,res)=>{
  const id=Number(req.params.id);
  if(!Number.isSafeInteger(id) || id<1) return res.status(404).end();
  await photoSchema();
  const result=await db.query('SELECT mime_type,content FROM product_images WHERE product_id=$1',[id]);
  const photo=result.rows[0];
  if (!photo) return res.status(404).end();
  const etag='"'+createHash('sha256').update(photo.content).digest('hex')+'"';
  res.set({'Content-Type':photo.mime_type,'Cache-Control':'public, max-age=60, must-revalidate',
    'X-Content-Type-Options':'nosniff','ETag':etag});
  if(req.headers['if-none-match']===etag) return res.status(304).end();
  res.send(photo.content);
}));

const checkout = async (buyer, b) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    let total = 0;
    const lines = [];

    // Lock rows in stable order to reduce deadlocks when buyers check out simultaneously.
    for (const item of [...b.items].sort((a, b) => a.product_id - b.product_id)) {
      if (
        !Number.isSafeInteger(item.product_id) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        throw Object.assign(new Error('Miqdor xato'), { status: 400 });
      }

      const result = await client.query(
        'SELECT * FROM products WHERE id=$1 AND is_active=TRUE FOR UPDATE',
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
      (order_id, product_id, seller_id, product_name, quantity, price, unit_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [orderId, p.id, p.seller_id, p.name, quantity, p.price, p.price]
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
  if (!b || typeof b !== 'object' ||
      typeof b.customer_name !== 'string' || !b.customer_name.trim() || b.customer_name.length > 120 ||
      typeof b.phone !== 'string' || b.phone.trim().length < 9 || b.phone.length > 35 ||
      !/^[+()0-9\s-]+$/.test(b.phone.trim()) ||
      typeof b.address !== 'string' || b.address.trim().length < 5 || b.address.length > 500 ||
      (b.note != null && (typeof b.note !== 'string' || b.note.length > 500)) ||
      !Array.isArray(b.items) || b.items.length === 0 || b.items.length > 100 ||
      b.items.some(x => !x || typeof x !== 'object') ||
      new Set(b.items.map(x => x.product_id)).size !== b.items.length) {
    return res.status(400).json({error:'Buyurtma ma’lumotlarini tekshiring'});
  }
 const result = await checkout(req.user, b);
res.status(201).json(result);
}));
app.get('/api/orders/mine', auth('buyer'), wrap(async (req, res) => {
  await deliverySchema();
  const ordersResult = await db.query(
    'SELECT * FROM orders WHERE buyer_id=$1 ORDER BY id DESC',
    [req.user.id]
  );

  const orders = [];

  for (const order of ordersResult.rows) {
    const itemsResult = await db.query(
      `SELECT id, order_id, product_id, product_name,
              quantity, unit_price, status, estimated_delivery_at
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
  await deliverySchema();
  const result = await db.query(
    `SELECT
       oi.id AS item_id,
       oi.order_id,
       oi.product_name,
       oi.quantity,
       oi.unit_price,
       oi.status AS status,
       oi.estimated_delivery_at,
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
    const { status, estimated_delivery_at } = req.body || {};
    if (!['Yangi','Jarayonda','Yetkazilgan'].includes(status)) return res.status(400).json({error:'Buyurtma holati xato'});
    const hasEtaField = Object.prototype.hasOwnProperty.call(req.body || {}, 'estimated_delivery_at');
    let eta = null;
    if (estimated_delivery_at != null && estimated_delivery_at !== '') {
      if (typeof estimated_delivery_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?Z$/.test(estimated_delivery_at)) {
        return res.status(400).json({error:'Yetkazish sanasi ISO UTC formatida bo‘lishi kerak'});
      }
      const date=new Date(estimated_delivery_at);
      if(Number.isNaN(date.getTime()) || date.getTime() > Date.now()+90*86400000) return res.status(400).json({error:'Yetkazish sanasi noto‘g‘ri'});
      eta=date.toISOString();
    }
    await deliverySchema();
    // Preserve an already confirmed ETA on status-only updates.
    const result=await db.query(
      'UPDATE order_items SET status=$1, ' +
      'estimated_delivery_at=CASE WHEN $4::boolean THEN $2::timestamptz ELSE estimated_delivery_at END ' +
      'WHERE id=$3 AND seller_id=$5 ' +
      "AND ($1 <> 'Jarayonda' OR " +
      "COALESCE(CASE WHEN $4::boolean THEN $2::timestamptz ELSE estimated_delivery_at END, '-infinity'::timestamptz) > NOW()) " +
      'RETURNING id,status,estimated_delivery_at',
      [status,eta,req.params.itemId,hasEtaField,req.user.id]
    );
    if (!result.rows.length) {
      const check=await db.query('SELECT id FROM order_items WHERE id=$1 AND seller_id=$2',[req.params.itemId,req.user.id]);
      return res.status(check.rows.length?400:404).json({error:check.rows.length?
        'Buyurtmani qabul qilish uchun kelajakdagi taxminiy yetkazish sanasi va vaqtini belgilang':
        'Buyurtma qismi topilmadi'});
    }
    res.json({ok:true,item:result.rows[0]});
  })
);

app.use((err, req, res, next) => {
  console.error('[API]', req.method, req.path, err);
  if (res.headersSent) return next(err);
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Bunday ma’lumot boshqa akkauntda allaqachon mavjud' });
  }
  const status = err.type === 'entity.too.large' ? 413 :
    (Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500);
  res.status(status).json({ error: status === 500 ? 'Server xatosi' : err.message });
});
app.listen(Number(process.env.PORT)||4000,()=>console.log('API http://localhost:'+(process.env.PORT||4000)));
