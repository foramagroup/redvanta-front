import { useCartStore } from "../store/cartStore";

export default function useCart() {
  const { items, addItem, removeItem, clear } = useCartStore();
  return { items, addItem, removeItem, clear };
}
