import type { CoffeeItem, CoffeeCategory } from "@shared/schema";

// QahwaCup coffee images paths - using public directory for reliable access
const latteArtImg = "/images/latte-art.png";
const cappuccinoFoamImg = "/images/cappuccino-foam.png";
const mochaSwirlImg = "/images/mocha-swirl.png";
const espressoShotImg = "/images/espresso-shot.png";
const vanillaCreamImg = "/images/vanilla-cream.png";
const icedCreamCoffeeImg = "/images/iced-cream-coffee.png";
const icedMochaImg = "/images/iced-mocha.png";
const whippedSpecialtyImg = "/images/whipped-specialty.png";
const coldBrewIceImg = "/images/cold-brew-ice.png";
const icedChocolateImg = "/images/iced-chocolate.png";
const americanoBlackImg = "/images/americano-black.png";
const signatureQahwaImg = "/images/signature-qahwa.png";
const premiumLatteImg = "/images/premium-latte.png";
const classicEspressoImg = "/images/classic-espresso.png";
const goldenLatteImg = "/images/golden-latte.png";

// Coffee categories configuration
export const coffeeCategories = [
  {
    id: "basic" as CoffeeCategory,
    nameAr: "قهوة أساسية",
    nameEn: "Basic Coffee",
    description: "مجموعة من القهوة الأساسية المحضرة بعناية",
    icon: "coffee"
  },
  {
    id: "hot" as CoffeeCategory,
    nameAr: "قهوة ساخنة",
    nameEn: "Hot Coffee",
    description: "تشكيلة من المشروبات الساخنة اللذيذة",
    icon: "fire"
  },
  {
    id: "cold" as CoffeeCategory,
    nameAr: "قهوة باردة",
    nameEn: "Cold Coffee",
    description: "مشروبات باردة منعشة ومثلجة",
    icon: "snowflake"
  }
];

// Perfectly matched coffee menu data with QahwaCup images
export const defaultCoffeeMenu: CoffeeItem[] = [
  // Basic Coffee
  {
    id: "espresso-single",
    nameAr: "إسبريسو (شوت)",
    nameEn: "Espresso Single",
    description: "قهوة إسبريسو مركزة من حبوب عربية مختارة",
    price: "4.00",
    oldPrice: "5.00",
    category: "basic",
    imageUrl: espressoShotImg,
    isAvailable: 1
  },
  {
    id: "espresso-double",
    nameAr: "إسبريسو (دبل شوت)",
    nameEn: "Espresso Double",
    description: "قهوة إسبريسو مضاعفة للباحثين عن النكهة القوية",
    price: "5.00",
    oldPrice: "6.00",
    category: "basic",
    imageUrl: classicEspressoImg,
    isAvailable: 1
  },
  {
    id: "americano",
    nameAr: "أمريكانو",
    nameEn: "Americano",
    description: "إسبريسو مخفف بالماء الساخن لطعم معتدل",
    price: "5.00",
    oldPrice: "6.00",
    category: "basic",
    imageUrl: americanoBlackImg,
    isAvailable: 1
  },
  {
    id: "ristretto",
    nameAr: "ريستريتو",
    nameEn: "Ristretto",
    description: "إسبريسو مركز بنصف كمية الماء لطعم أقوى",
    price: "5.00",
    oldPrice: "6.00",
    category: "basic",
    imageUrl: signatureQahwaImg,
    isAvailable: 1
  },
  
  // Hot Coffee
  {
    id: "cafe-latte",
    nameAr: "كافيه لاتيه",
    nameEn: "Cafe Latte",
    description: "إسبريسو مع حليب مخفوق كريمي ورغوة ناعمة",
    price: "5.00",
    oldPrice: "6.00",
    category: "hot",
    imageUrl: latteArtImg,
    isAvailable: 1
  },
  {
    id: "cappuccino",
    nameAr: "كابتشينو",
    nameEn: "Cappuccino",
    description: "مزيج متوازن من الإسبريسو والحليب والرغوة",
    price: "5.00",
    oldPrice: "6.00",
    category: "hot",
    imageUrl: cappuccinoFoamImg,
    isAvailable: 1
  },
  {
    id: "vanilla-latte",
    nameAr: "فانيلا لاتيه",
    nameEn: "Vanilla Latte",
    description: "لاتيه كلاسيكي مع نكهة الفانيلا الطبيعية",
    price: "6.00",
    oldPrice: "7.00",
    category: "hot",
    imageUrl: vanillaCreamImg,
    isAvailable: 1
  },
  {
    id: "mocha",
    nameAr: "موكا",
    nameEn: "Mocha",
    description: "مزيج رائع من القهوة والشوكولاتة والحليب",
    price: "7.00",
    oldPrice: "8.00",
    category: "hot",
    imageUrl: mochaSwirlImg,
    isAvailable: 1
  },
  {
    id: "con-panna",
    nameAr: "كافيه كون بانا",
    nameEn: "Cafe Con Panna",
    description: "إسبريسو مع كريمة مخفوقة طازجة",
    price: "5.00",
    oldPrice: "6.00",
    category: "hot",
    imageUrl: whippedSpecialtyImg,
    isAvailable: 1
  },
  {
    id: "coffee-day-hot",
    nameAr: "قهوة اليوم (حار)",
    nameEn: "Coffee of the Day Hot",
    description: "تشكيلة مختارة يومياً من أفضل حبوب القهوة",
    price: "4.95",
    oldPrice: "5.50",
    category: "hot",
    imageUrl: goldenLatteImg,
    isAvailable: 1
  },
  
  // Cold Coffee
  {
    id: "iced-latte",
    nameAr: "آيسد لاتيه",
    nameEn: "Iced Latte",
    description: "لاتيه منعش مع الثلج والحليب البارد",
    price: "6.00",
    oldPrice: "7.00",
    category: "cold",
    imageUrl: premiumLatteImg,
    isAvailable: 1
  },
  {
    id: "iced-mocha",
    nameAr: "آيسد موكا",
    nameEn: "Iced Mocha",
    description: "موكا باردة مع الشوكولاتة والكريمة المخفوقة",
    price: "7.00",
    oldPrice: "8.00",
    category: "cold",
    imageUrl: icedMochaImg,
    isAvailable: 1
  },
  {
    id: "iced-cappuccino",
    nameAr: "آيسد كابتشينو",
    nameEn: "Iced Cappuccino",
    description: "كابتشينو بارد مع رغوة الحليب المثلجة",
    price: "6.00",
    oldPrice: "7.00",
    category: "cold",
    imageUrl: icedCreamCoffeeImg,
    isAvailable: 1
  },
  {
    id: "iced-condensed",
    nameAr: "قهوة مثلجة بالحليب المكثف",
    nameEn: "Iced Coffee with Condensed Milk",
    description: "قهوة باردة مع حليب مكثف حلو ولذيذ",
    price: "5.00",
    oldPrice: "6.00",
    category: "cold",
    imageUrl: icedChocolateImg,
    isAvailable: 1
  },
  {
    id: "vanilla-cold-brew",
    nameAr: "فانيلا كولد برو",
    nameEn: "Vanilla Cold Brew",
    description: "قهوة باردة منقوعة ببطء مع نكهة الفانيلا",
    price: "6.00",
    oldPrice: "7.00",
    category: "cold",
    imageUrl: coldBrewIceImg,
    isAvailable: 1
  },
  {
    id: "coffee-day-cold",
    nameAr: "قهوة اليوم (بارد)",
    nameEn: "Coffee of the Day Cold",
    description: "تشكيلة مختارة يومياً من القهوة الباردة المنعشة",
    price: "4.95",
    oldPrice: "5.50",
    category: "cold",
    imageUrl: signatureQahwaImg,
    isAvailable: 1
  }
];

// Helper functions
export const getCoffeeItemsByCategory = (items: CoffeeItem[], category: CoffeeCategory): CoffeeItem[] => {
  return items.filter(item => item.category === category && item.isAvailable === 1);
};

export const calculateDiscount = (price: string, oldPrice?: string): number => {
  if (!oldPrice) return 0;
  const current = parseFloat(price);
  const old = parseFloat(oldPrice);
  return Math.round(((old - current) / old) * 100);
};

export const formatPrice = (price: string): string => {
  return `${parseFloat(price).toFixed(2)} ريال`;
};

export const getCategoryIcon = (category: CoffeeCategory): string => {
  const categoryInfo = coffeeCategories.find(cat => cat.id === category);
  return categoryInfo?.icon || "coffee";
};

export const getCategoryName = (category: CoffeeCategory): string => {
  const categoryInfo = coffeeCategories.find(cat => cat.id === category);
  return categoryInfo?.nameAr || category;
};