import { Component, inject } from '@angular/core';

import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { catchError, Observable, EMPTY, Subject } from 'rxjs';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, NgClass, ProductDetailComponent]
})
export class ProductListComponent {
  // Just enough here for the template to compile
  pageTitle = 'Products';
  errorMessage = '';
  private productService = inject(ProductService);

  readonly  productSelected$ = this.productService.productSelected$;
  // Products
  readonly products$ = this.productService.products$
  .pipe(
    catchError(error =>  {
      this.errorMessage = error;
      return EMPTY;
    })
  );

  readonly product$ = this.productService.product$.pipe();
  // Selected product id to highlight the entry
  readonly selectedProductId$ = this.productService.productSelected$;

  onSelected(productId: number): void {
    this.productService.productSelected(productId);
  }
}
