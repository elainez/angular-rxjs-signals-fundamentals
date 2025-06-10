import { Injectable, signal, effect, computed } from '@angular/core';
import { Product } from "../products/product";
import { CartItem } from "./cart";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<CartItem[]>([]);
  eLength = effect(() => console.log('cart carrry length', this.cartItems().length));

  cartTotal = computed(() => this.cartItems()
    .reduce((accumulatedQty, item) => accumulatedQty + item.quantity, 0)
  );

  subTotal = computed(() => this.cartItems()
    .reduce((accTotal, item) => (accTotal + item.product.price * item.quantity), 0)
  );

  deliveryFee = computed(() => this.subTotal() < 50 ? 5.99 : 0);// ;
  tax = computed(() => Math.round(this.subTotal() * 10.75 / 100));
  totalPrice = computed(() => this.subTotal() + this.deliveryFee() + this.tax());


  addToCart(product: Product): void {
    this.cartItems.update(items => [...items, { product, quantity: 1 }]);
  }

  updateQuantity(cartItem: CartItem, quantity: number): void {
    this.cartItems.update(items =>
      items.map(item => item.product.id === cartItem.product.id ? { ...item, quantity } : item));
  }

  removeFromCart(cartItem: CartItem): void{
    this.cartItems.update(items => 
      items.filter(item => item.product.id != cartItem.product.id)
    );
  }
}
