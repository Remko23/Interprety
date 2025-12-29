import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart') || '[]')
  }),
  getters: {
    totalPrice: (state) => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
    count: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0)
  },
  actions: {
    addToCart(product) {
      const existing = this.items.find(i => i.id === product.id)
      if (existing) {
        existing.quantity++
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
      this.save()
    },
    removeFromCart(index) {
      this.items.splice(index, 1)
      this.save()
    },
    save() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    }
  }
})