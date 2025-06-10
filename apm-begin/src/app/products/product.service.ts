import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, filter, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Product } from './product';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Just enough here for the code to compile
  private productsUrl = 'api/products';
  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private revieiwService = inject(ReviewService);

  private productSelectedSubject = new BehaviorSubject<number | undefined>(undefined);
  readonly productSelected$ = this.productSelectedSubject.asObservable();

  productSelected(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  readonly products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      //tap(data => console.log(JSON.stringify(data))),
      shareReplay(1),
      catchError(error => this.handleError(error))
    );


  readonly product$ = this.productSelected$
    .pipe(
      filter(Boolean),
      switchMap(id => {
        const productUrl = `${this.productsUrl}/${id}`;
        return this.http.get<Product>(productUrl)
          .pipe(
            //tap(p => console.log('product found', p)),
            switchMap(p => this.getProductWithReview(p)),
            catchError(error => this.handleError(error))
          );
      })
    );


  private getProductWithReview(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http.get<Review[]>(this.revieiwService.getReviewUrl(product.id))
        .pipe(
          map(reviews => ({ ...product, reviews }))
        )
    }
    else {
      return of(product);
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const formattedMesage = this.errorService.formatError(error);
    return throwError(() => formattedMesage);
  }
}