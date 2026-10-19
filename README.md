# MiniMarket — Onlayn Marketplace

React + Vite frontend, Node.js + Express backend, SQLite database, JWT authentication.

## Talablar
Node.js 20+ (better-sqlite3 uchun mos versiya va build vositalari kerak bo‘lishi mumkin), npm.

## Ishga tushirish
1. Terminalda loyiha papkasini oching.
2. `npm run install:all`
3. `server/.env.example` faylini `server/.env` nomi bilan nusxalang.
4. `.env` dagi `JWT_SECRET` ni uzun, tasodifiy maxfiy qiymatga almashtiring.
5. `npm run dev`
6. Brauzerda `http://localhost:5173` ni oching.

API: `http://localhost:4000`. SQLite fayli server/minimarket.db da avtomatik yaratiladi.

## Tekshirish
1. Sotuvchi akkauntini yarating, mahsulot qo‘shing.
2. Chiqib, xaridor akkauntini yarating.
3. Mahsulot qidiring, savatchaga qo‘shing va buyurtma bering.
4. Sotuvchi akkauntida buyurtmani ochib holatini o‘zgartiring.
5. Xaridor akkauntida yangi holatni tekshiring.

## API
- POST /api/auth/register, /api/auth/login; GET /api/auth/me
- GET /api/products, /api/products/:id, /api/categories
- POST /api/products; PUT/DELETE /api/products/:id (seller)
- GET /api/seller/products, /api/seller/orders (seller)
- PATCH /api/seller/orders/:itemId (seller)
- POST /api/orders, GET /api/orders/mine (buyer)

## Eslatmalar
Demo/test loyiha. Haqiqiy to‘lov yo‘q. Rasm uchun URL ishlatiladi; fayl upload yo‘q.
Savatcha browser localStorage da, asosiy ma’lumotlar SQLite da.
Checkout tranzaksiyada serverdagi narx va qoldiqni tekshiradi.
Production uchun HTTPS, rate limiting, kuchli validatsiya, audit, xavfsiz sessiya/cookie, zaxira nusxa, testlar va deployment konfiguratsiyasi qo‘shilishi kerak.
