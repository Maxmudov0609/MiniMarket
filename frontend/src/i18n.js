import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  uz: {
    translation: {
      welcome: "MiniMarketga xush kelibsiz!",
      search: "Mahsulot qidirish...",
      allCategories: "Barcha kategoriyalar",
      products: "Mahsulotlarni ko‘rish",
      cart: "Savatcha",
      favorites: "Sevimlilar",
      logout: "Akkauntdan chiqish",
      sellerPanel: "Sotuvchi kabineti",
      addToCart: "Savatchaga qo‘shish",
    },
  },
  ru: {
    translation: {
      welcome: "Добро пожаловать в MiniMarket!",
      search: "Поиск товаров...",
      allCategories: "Все категории",
      products: "Смотреть товары",
      cart: "Корзина",
      favorites: "Избранное",
      logout: "Выйти из аккаунта",
      sellerPanel: "Кабинет продавца",
      addToCart: "Добавить в корзину",
    },
  },
  en: {
    translation: {
      welcome: "Welcome to MiniMarket!",
      search: "Search products...",
      allCategories: "All categories",
      products: "View products",
      cart: "Cart",
      favorites: "Favorites",
      logout: "Log out",
      sellerPanel: "Seller dashboard",
      addToCart: "Add to cart",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("minimarket-language") || "uz",
  fallbackLng: "uz",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;