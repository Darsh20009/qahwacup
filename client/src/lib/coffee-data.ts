import type { CoffeeItem, CoffeeCategory } from "@shared/schema";

// Coffee image mapping function - each drink gets its unique image
const getCoffeeImage = (coffeeId: string): string => {
  const imageMap: Record<string, string> = {
    "espresso-single": "/images/espresso-single.png",
    "espresso-double": "/images/espresso-double.png", 
    "americano": "/images/americano.png",
    "ristretto": "/images/ristretto.png",
    "turkish-coffee": "/attached_assets/Screenshot 2025-10-05 003822_1759666311817.png",
    "cafe-latte": "/images/cafe-latte.png",
    "cappuccino": "/images/cappuccino.png",
    "vanilla-latte": "/images/vanilla-latte.png",
    "mocha": "/images/mocha.png",
    "con-panna": "/images/con-panna.png",
    "french-press": "/attached_assets/Screenshot 2025-10-05 003844_1759666320914.png",
    "coffee-day-hot": "/images/golden-latte.png",
    "hot-tea": "/attached_assets/Screenshot 2025-09-19 161654_1758288116712.png",
    "ice-tea": "/attached_assets/Screenshot 2025-09-19 161645_1758288659656.png",
    "iced-matcha-latte": "/attached_assets/Screenshot 2025-09-19 161627_1758288688792.png",
    "hot-matcha-latte": "/attached_assets/Screenshot 2025-09-19 161637_1758288723420.png",
    "iced-latte": "/images/iced-latte.png",
    "iced-mocha": "/images/iced-mocha-drink.png",
    "iced-cappuccino": "/images/iced-cappuccino.png",
    "iced-condensed": "/images/iced-chocolate.png",
    "vanilla-cold-brew": "/images/vanilla-cold-brew.png",
    "coffee-day-cold": "/images/signature-qahwa.png",
    "coffee-dessert-cup": "/attached_assets/Screenshot 2025-10-05 012338_1759666320915.png"
  };
  
  return imageMap[coffeeId] || "/images/default-coffee.png";
};

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
  },
  {
    id: "specialty" as CoffeeCategory,
    nameAr: "المشروبات الإضافية",
    nameEn: "Specialty Drinks",
    description: "تشكيلة استثنائية من المشروبات المميزة والفريدة",
    icon: "star"
  },
  {
    id: "desserts" as CoffeeCategory,
    nameAr: "الحلويات",
    nameEn: "Desserts",
    description: "حلويات شهية ولذيذة تكمل تجربة القهوة",
    icon: "cake"
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
    imageUrl: getCoffeeImage("espresso-single"),
    isAvailable: 1,
    coffeeStrength: "strong",
    strengthLevel: 10
  },
  {
    id: "espresso-double",
    nameAr: "إسبريسو (دبل شوت)",
    nameEn: "Espresso Double",
    description: "قهوة إسبريسو مضاعفة للباحثين عن النكهة القوية",
    price: "5.00",
    oldPrice: "6.00",
    category: "basic",
    imageUrl: getCoffeeImage("espresso-double"),
    isAvailable: 1,
    coffeeStrength: "strong",
    strengthLevel: 12
  },
  {
    id: "americano",
    nameAr: "أمريكانو",
    nameEn: "Americano",
    description: "إسبريسو مخفف بالماء الساخن لطعم معتدل",
    price: "5.00",
    oldPrice: "6.00",
    category: "basic",
    imageUrl: getCoffeeImage("americano"),
    isAvailable: 1,
    coffeeStrength: "mild",
    strengthLevel: 3
  },
  {
    id: "ristretto",
    nameAr: "ريستريتو",
    nameEn: "Ristretto",
    description: "إسبريسو مركز بنصف كمية الماء لطعم أقوى",
    price: "5.00",
    oldPrice: "6.00",
    category: "basic",
    imageUrl: getCoffeeImage("ristretto"),
    isAvailable: 1,
    coffeeStrength: "strong",
    strengthLevel: 11
  },
  {
    id: "turkish-coffee",
    nameAr: "قهوة تركي",
    nameEn: "Turkish Coffee",
    description: "قهوة تركية تقليدية محضرة بطريقة عريقة، غنية بالنكهة والتراث",
    price: "5.00",
    oldPrice: null,
    category: "basic",
    imageUrl: getCoffeeImage("turkish-coffee"),
    isAvailable: 1,
    coffeeStrength: "medium",
    strengthLevel: 6
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
    imageUrl: getCoffeeImage("cafe-latte"),
    isAvailable: 1,
    coffeeStrength: "classic",
    strengthLevel: null
  },
  {
    id: "cappuccino",
    nameAr: "كابتشينو",
    nameEn: "Cappuccino",
    description: "مزيج متوازن من الإسبريسو والحليب والرغوة",
    price: "5.00",
    oldPrice: "6.00",
    category: "hot",
    imageUrl: getCoffeeImage("cappuccino"),
    isAvailable: 1,
    coffeeStrength: "classic",
    strengthLevel: null
  },
  {
    id: "vanilla-latte",
    nameAr: "فانيلا لاتيه",
    nameEn: "Vanilla Latte",
    description: "لاتيه كلاسيكي مع نكهة الفانيلا الطبيعية",
    price: "6.00",
    oldPrice: "7.00",
    category: "hot",
    imageUrl: getCoffeeImage("vanilla-latte"),
    isAvailable: 1,
    coffeeStrength: "classic",
    strengthLevel: null
  },
  {
    id: "mocha",
    nameAr: "موكا",
    nameEn: "Mocha",
    description: "مزيج رائع من القهوة والشوكولاتة والحليب",
    price: "7.00",
    oldPrice: "8.00",
    category: "hot",
    imageUrl: getCoffeeImage("mocha"),
    isAvailable: 1,
    coffeeStrength: "medium",
    strengthLevel: 6
  },
  {
    id: "con-panna",
    nameAr: "كافيه كون بانا",
    nameEn: "Cafe Con Panna",
    description: "إسبريسو مع كريمة مخفوقة طازجة",
    price: "5.00",
    oldPrice: "6.00",
    category: "hot",
    imageUrl: getCoffeeImage("con-panna"),
    isAvailable: 1,
    coffeeStrength: "medium",
    strengthLevel: 7
  },
  {
    id: "coffee-day-hot",
    nameAr: "قهوة اليوم (حار)",
    nameEn: "Coffee of the Day Hot",
    description: "تشكيلة مختارة يومياً من أفضل حبوب القهوة",
    price: "4.95",
    oldPrice: "5.50",
    category: "hot",
    imageUrl: getCoffeeImage("coffee-day-hot"),
    isAvailable: 1,
    coffeeStrength: "classic",
    strengthLevel: null
  },
  {
    id: "french-press",
    nameAr: "قهوة فرنسي",
    nameEn: "French Press Coffee",
    description: "قهوة فرنسية فاخرة محضرة بطريقة الكبس الفرنسي، تمنحك نكهة غنية ومميزة",
    price: "6.00",
    oldPrice: null,
    category: "hot",
    imageUrl: getCoffeeImage("french-press"),
    isAvailable: 1,
    coffeeStrength: "medium",
    strengthLevel: 6
  },
  {
    id: "hot-tea",
    nameAr: "شاي حار",
    nameEn: "Hot Tea",
    description: "شاي طبيعي مُحضر بعناية من أوراق الشاي المختارة، يُقدم ساخناً ومنعشاً لبداية يوم مثالية",
    price: "2.00",
    oldPrice: null,
    category: "specialty",
    imageUrl: getCoffeeImage("hot-tea"),
    isAvailable: 1,
    coffeeStrength: "classic",
    strengthLevel: null
  },
  {
    id: "ice-tea",
    nameAr: "آيس تي",
    nameEn: "Ice Tea",
    description: "انتعاش لا يُقاوم مع مزيج مثالي من الشاي المنقوع ببرودة والطعم المميز، رحلة منعشة في كل رشفة تجدد طاقتك وتمنحك لحظات من الصفاء",
    price: "3.00",
    oldPrice: null,
    category: "specialty",
    imageUrl: getCoffeeImage("ice-tea"),
    isAvailable: 1,
    coffeeStrength: "classic",
    strengthLevel: null
  },
  {
    id: "iced-matcha-latte",
    nameAr: "آيس لاتيه ماتشا",
    nameEn: "Iced Matcha Latte",
    description: "إبداع ياباني ساحر يجمع بين نعومة الحليب المثلج وسحر الماتشا الأخضر النقي، تجربة بصرية وذوقية استثنائية تأخذك في رحلة إلى عالم من الهدوء والتميز",
    price: "10.00",
    oldPrice: null,
    category: "specialty",
    imageUrl: getCoffeeImage("iced-matcha-latte"),
    isAvailable: 1,
    coffeeStrength: "classic",
    strengthLevel: null
  },
  {
    id: "hot-matcha-latte",
    nameAr: "لاتيه ماتشا حار",
    nameEn: "Hot Matcha Latte",
    description: "دفء ساحر يلتقي مع نكهة الماتشا الاستثنائية في لحن متناغم من الكريمة والطعم الياباني الأصيل، يُقدم ساخناً بفن لاتيه مبهر يسعد العين قبل أن يأسر الذوق",
    price: "11.00",
    oldPrice: null,
    category: "specialty",
    imageUrl: getCoffeeImage("hot-matcha-latte"),
    isAvailable: 1,
    coffeeStrength: "classic",
    strengthLevel: null
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
    imageUrl: getCoffeeImage("iced-latte"),
    isAvailable: 1,
    coffeeStrength: "classic",
    strengthLevel: null
  },
  {
    id: "iced-mocha",
    nameAr: "آيسد موكا",
    nameEn: "Iced Mocha",
    description: "موكا باردة مع الشوكولاتة والكريمة المخفوقة",
    price: "7.00",
    oldPrice: "8.00",
    category: "cold",
    imageUrl: getCoffeeImage("iced-mocha"),
    isAvailable: 1,
    coffeeStrength: "medium",
    strengthLevel: 5
  },
  {
    id: "iced-cappuccino",
    nameAr: "آيسد كابتشينو",
    nameEn: "Iced Cappuccino",
    description: "كابتشينو بارد مع رغوة الحليب المثلجة",
    price: "6.00",
    oldPrice: "7.00",
    category: "cold",
    imageUrl: getCoffeeImage("iced-cappuccino"),
    isAvailable: 1,
    coffeeStrength: "classic",
    strengthLevel: null
  },
  {
    id: "iced-condensed",
    nameAr: "قهوة مثلجة بالحليب المكثف",
    nameEn: "Iced Coffee with Condensed Milk",
    description: "قهوة باردة مع حليب مكثف حلو ولذيذ",
    price: "5.00",
    oldPrice: "6.00",
    category: "cold",
    imageUrl: getCoffeeImage("iced-condensed"),
    isAvailable: 1,
    coffeeStrength: "medium",
    strengthLevel: 5
  },
  {
    id: "vanilla-cold-brew",
    nameAr: "فانيلا كولد برو",
    nameEn: "Vanilla Cold Brew",
    description: "قهوة باردة منقوعة ببطء مع نكهة الفانيلا",
    price: "6.00",
    oldPrice: "7.00",
    category: "cold",
    imageUrl: getCoffeeImage("vanilla-cold-brew"),
    isAvailable: 1,
    coffeeStrength: "mild",
    strengthLevel: 2
  },
  {
    id: "coffee-day-cold",
    nameAr: "قهوة اليوم (بارد)",
    nameEn: "Coffee of the Day Cold",
    description: "تشكيلة مختارة يومياً من القهوة الباردة المنعشة",
    price: "4.95",
    oldPrice: "5.50",
    category: "cold",
    imageUrl: getCoffeeImage("coffee-day-cold"),
    isAvailable: 1,
    coffeeStrength: "classic",
    strengthLevel: null
  },
  
  // Desserts
  {
    id: "coffee-dessert-cup",
    nameAr: "حلى قهوة كوب",
    nameEn: "Coffee Dessert Cup",
    description: "حلى قهوة فاخر في كوب، طبقات من الكريمة والقهوة والبسكويت المطحون، تجربة حلوة لا تُنسى",
    price: "8.00",
    oldPrice: null,
    category: "desserts",
    imageUrl: getCoffeeImage("coffee-dessert-cup"),
    isAvailable: 1,
    coffeeStrength: "classic",
    strengthLevel: null
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