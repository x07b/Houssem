export interface Product {
  id: string;
  name: string;
  valueLabel: string;
  priceUSD: number;
  image: string;
  description: string;
}

export const products: Product[] = [
  {
    id: "steam-50",
    name: "Steam Gift Card $50",
    valueLabel: "$50",
    priceUSD: 47,
    image: "https://images.pexels.com/photos/19435870/pexels-photo-19435870.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Top up your Steam wallet instantly and enjoy thousands of games.",
  },
  {
    id: "psn-20",
    name: "PlayStation Card $20",
    valueLabel: "$20",
    priceUSD: 19,
    image: "https://images.pexels.com/photos/7199194/pexels-photo-7199194.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Redeem on PlayStation Store for games, DLC, and more.",
  },
  {
    id: "xbox-25",
    name: "Xbox Gift Card $25",
    valueLabel: "$25",
    priceUSD: 23.5,
    image: "https://images.pexels.com/photos/33797245/pexels-photo-33797245.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Buy games, add-ons, and in-game content on Xbox and PC.",
  },
];

export const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
