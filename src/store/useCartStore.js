import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cart: [],

  addToCart: (food) => set((state) => {
    const existingItem = state.cart.find((item) => item.id === food.id);
    if (existingItem) {
      // Increase quantity if item exists
      return {
        cart: state.cart.map((item) =>
          item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    // Add new item if it doesnt exist
    return { cart: [...state.cart, { ...food, quantity: 1 }] };
  }),

  removeFromCart: (foodId) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== foodId),
  })),

  updateQuantity: (foodId, quantity) => set((state) => {
    if (quantity < 1) return state; // Validasi qty tidak boleh < 1
    return {
      cart: state.cart.map((item) =>
        item.id === foodId ? { ...item, quantity } : item
      ),
    };
  }),

  clearCart: () => set({ cart: [] }),

  getTotalPrice: () => {
    return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  getTotalItems: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  }
}));
