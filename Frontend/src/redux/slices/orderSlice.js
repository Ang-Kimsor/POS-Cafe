import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  taxRate: 0,
};

const calculateTotals = (state) => {
  state.subtotal = state.items.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  state.tax = state.subtotal * state.taxRate;
  state.total = state.subtotal + state.tax;
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const product = action.payload;
      // Ensure price is always a proper number
      const safePrice = parseFloat(product.price) || 0;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.qty += 1;
      } else {
        state.items.push({ ...product, price: safePrice, qty: 1 });
      }
      calculateTotals(state);
    },
    removeItem: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
      calculateTotals(state);
    },
    updateQuantity: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.qty = Math.max(1, qty);
        calculateTotals(state);
      }
    },
    clearOrder: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.total = 0;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
