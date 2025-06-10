import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { CartItem } from '../cart';
import { CartItemComponent } from '../cart-item/cart-item.component';
import { CartService } from '../cart.service';
import { single } from 'rxjs';

@Component({
  selector: 'sw-cart-list',
  standalone: true,
  imports: [CartItemComponent, NgFor, NgIf],
  templateUrl: 'cart-list.component.html'
})
export class CartListComponent {
  pageTitle = 'Cart';
  private carService = inject(CartService);
  cartItems = this.carService.cartItems;
}
