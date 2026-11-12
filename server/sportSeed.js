// Sport katalogi uchun dastlabki NAMUNAVIY mahsulotlar.
// Narx va qoldiq do'kon egasi tomonidan sotuv boshlanishidan oldin tasdiqlanishi kerak.
// Avval yaratilgan yoki keyinchalik o'chirilgan mahsulotlar qayta qo'shilmaydi.
import { db } from './db.js';

const sportProducts = [
  ['Futbol to‘pi — Classic №5', 'Mashg‘ulot va havaskor futbol o‘yinlari uchun 5-o‘lchamli to‘p.', 149000, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&auto=format&fit=crop'],
  ['Basketbol to‘pi — Street', 'Ochiq maydon va zalda basketbol o‘ynash uchun to‘p.', 189000, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&auto=format&fit=crop'],
  ['Gantel 5 kg', 'Uyda kuch mashqlari uchun 5 kg og‘irlikdagi gantel.', 219000, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&auto=format&fit=crop'],
  ['Yugurish krossovkasi', 'Kundalik yugurish va fitnes mashg‘ulotlari uchun qulay oyoq kiyim.', 399000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop'],
  ['Tennis raketkasi', 'Havaskorlar uchun tennis raketkasi.', 329000, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=900&auto=format&fit=crop'],
  ['Sport suv idishi 750 ml', 'Mashg‘ulot paytida suv ichish uchun qayta ishlatiladigan idish.', 69000, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=900&auto=format&fit=crop'],
  ['Yoga mati', 'Yoga, stretching va uy mashqlari uchun yumshoq mat.', 179000, 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=900&auto=format&fit=crop'],
  ['Sakrash arqoni', 'Kardio mashqlar uchun yengil va qulay arqon.', 59000, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&auto=format&fit=crop']
];

export async function seedSportProducts() {
  // Faqat loyiha admini egasi sifatida joylanadi; boshqa sotuvchilarning mahsulotlariga tegilmaydi.
  const owner = await db.query("SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1");
  if (!owner.rows.length) {
    console.warn('[SPORT SEED] Admin topilmadi; namuna mahsulotlar qo‘shilmadi.');
    return;
  }

  let created = 0;
  for (const [name, description, price, imageUrl] of sportProducts) {
    const result = await db.query(
      `INSERT INTO products (seller_id, name, description, price, category, image_url, stock)
       SELECT $1, $2, $3, $4, 'Sport', $5, 0
       WHERE NOT EXISTS (
         SELECT 1 FROM products WHERE category = 'Sport' AND name = $2
       )
       RETURNING id`,
      [owner.rows[0].id, name, description, price, imageUrl]
    );
    created += result.rowCount;
  }
  console.log(`[SPORT SEED] ${created} ta yangi namuna mahsulot qo‘shildi (ombordagi qoldiq: 0).`);
}
