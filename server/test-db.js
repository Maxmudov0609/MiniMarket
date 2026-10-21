import { db } from './db.js';

try {
  const result = await db.query('SELECT NOW()');
  console.log('✅ Supabase bazasiga ulanish muvaffaqiyatli!');
  console.log(result.rows);
} catch (error) {
  console.log('❌ Ulanishda xatolik:', error.message);
} finally {
  await db.end();
}