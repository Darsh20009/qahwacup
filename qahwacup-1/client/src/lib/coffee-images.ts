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
 "hot-tea": "/attached_assets/Screenshot 2025-09-19 161654_1758288116712.png",
 "ice-tea": "/attached_assets/Screenshot 2025-09-19 161645_1758288659656.png",
 "iced-matcha-latte": "/attached_assets/Screenshot 2025-09-19 161627_1758288688792.png",
 "hot-matcha-latte": "/attached_assets/Screenshot 2025-09-19 161637_1758288723420.png",
 "iced-latte": "/images/iced-latte.png",
 "iced-mocha": "/images/iced-mocha-drink.png",
 "iced-cappuccino": "/images/iced-cappuccino.png",
 "iced-condensed": "/images/iced-chocolate.png",
 "vanilla-cold-brew": "/images/vanilla-cold-brew.png",
 "cold-brew": "/attached_assets/Screenshot 2025-09-09 192140_1757443887277.png",
 "coffee-day-cold": "/attached_assets/coffee-day-cold-new.png",
 "turkish-coffee": "/attached_assets/Screenshot 2025-10-05 003822_1759666311817.png",
 "french-press": "/attached_assets/Screenshot 2025-10-05 003844_1759666320914.png",
 "coffee-dessert-cup": "/attached_assets/Screenshot 2025-10-05 012338_1759666320915.png"
 };
 
 return imageMap[coffeeId] || "/images/default-coffee.png";
};