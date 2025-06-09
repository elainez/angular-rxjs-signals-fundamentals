import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, Observable, shareReplay, tap, throwError } from 'rxjs';
import { Product } from './product';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpErrorService } from '../utilities/http-error.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Just enough here for the code to compile
  private productsUrl = 'api/products';
  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);

  readonly products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log(JSON.stringify(data))),
      shareReplay(1),
      catchError(error => this.handleError(error))
    );

  private handleError(error: HttpErrorResponse): Observable<never> {
    const formattedMesage = this.errorService.formatError(error);
    return throwError(() => formattedMesage);
  }
}