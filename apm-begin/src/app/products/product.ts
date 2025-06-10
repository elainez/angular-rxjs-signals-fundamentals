import { Review } from "../reviews/review";

/* Defines the product entity */
export interface Product {
  id: number;
  productName: string;
  productCode: string;
  description: string;
  price: number;
  quantityInStock?: number;
  hasReviews?: boolean;
  reviews?: Review[];
}

export interface Result<T>{
  error?: string; //made is optional so in case it is successful
  data : T | undefined; // make is underfined so in case an error occurs
}