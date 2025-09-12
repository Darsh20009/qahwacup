// Coffee image mapping function shared across components
export const getCoffeeImage = (coffeeId: string): string => {
  const imageMap: Record<string, string> = {
    "espresso-single": "/images/espresso-single.png",
    "espresso-double": "/images/espresso-double.png", 
    "americano": "/images/americano.png",
    "ristretto": "/images/ristretto.png",
    "cafe-latte": "/images/cafe-latte.png",
    "cappuccino": "/images/cappuccino.png",
    "vanilla-latte": "/images/vanilla-latte.png",
    "mocha": "/images/mocha.png",
    "con-panna": "/images/con-panna.png",
    "coffee-day-hot": "/attached_assets/coffee-day-hot-new.png",
    "iced-latte": "/images/iced-latte.png",
    "iced-mocha": "/images/iced-mocha-drink.png",
    "iced-cappuccino": "/images/iced-cappuccino.png",
    "iced-condensed": "/images/iced-chocolate.png",
    "vanilla-cold-brew": "/images/vanilla-cold-brew.png",
    "coffee-day-cold": "/images/signature-qahwa.png"
  };
  
  return imageMap[coffeeId] || "/images/default-coffee.png";
};