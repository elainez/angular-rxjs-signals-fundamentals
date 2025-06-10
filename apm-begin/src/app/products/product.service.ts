import { computed, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, filter, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Product, Result } from './product';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private revieiwService = inject(ReviewService);

  private productSelectedSubject = new BehaviorSubject<number | undefined>(undefined);
  productIdSelected = signal<number | undefined>(undefined);

  readonly productSelected$ = this.productSelectedSubject.asObservable();

  private productsResult$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      map(p => ({ data: p } as Result<Product[]>)),
      tap(p => console.log(JSON.stringify(p))),
      shareReplay(1),
      catchError(error => of(({
        data: [],
        error: this.errorService.formatError(error)
      } as Result<Product[]>))
      )
    );

  private productsResult = toSignal(this.productsResult$,
    { initialValue: ({ data: [] } as Result<Product[]>) });

  products = computed(() => this.productsResult().data);
  productsError = computed(() => this.productsResult().error);

  //this is the code using try catch, however, it hides the error
  //  products = computed(()=>{
  //   try {
  //     return toSignal(this.products$, { initialValue:[] as Product[]})();
  //   } catch (error) {
  //     return [] as Product[];
  //   }
  //  });

  private productResult$ = toObservable(this.productIdSelected)//this.productSelected$
    .pipe(
      filter(Boolean),
      switchMap(id => {
        const productUrl = `${this.productsUrl}/${id}`;
        return this.http.get<Product>(productUrl)
          .pipe(
            switchMap(p => this.getProductWithReview(p)),
            catchError(error => of({
              data: undefined,
              error: this.errorService.formatError(error)
            } as Result<Product>))
          );
      }),
      map(p => ({ data: p } as Result<Product>))
    );
  private productResult = toSignal(this.productResult$);
  product = computed(() => this.productResult()?.data);
  productError = computed(() => this.productResult()?.error);

  // product$ = combineLatest([this.productSelected$, this.products$])
  //   .pipe(
  //     map(([selectedProductId, products]) => {
  //       return products.find(p => p.id === selectedProductId);
  //     }),
  //     filter(Boolean),
  //     switchMap(product => this.getProductWithReview(product)),
  //     catchError(error => this.handleError(error))
  //   );

  productSelected(selectedProductId: number): void {
    //this.productSelectedSubject.next(selectedProductId);
    this.productIdSelected.set(selectedProductId);
  }

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