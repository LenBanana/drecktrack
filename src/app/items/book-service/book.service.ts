import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookApiResponse } from '../../../interfaces/book-search';
import { UserCollectibleItemDto } from '../../../interfaces/dtos/CollectibleItemDto';
import { mapGoogleBookToCollectibleItem } from '../../../utils/book-utils';

export const baseBookApiUrl = 'https://www.googleapis.com/books/v1/volumes';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(private http: HttpClient) { }

  searchBooks(query: string): Observable<UserCollectibleItemDto[]> {
    const isbnRegex = /^(97(8|9))?\d{9}(\d|X)$/;
    if (isbnRegex.test(query.replace(/-/g, ''))) {
      // If it's an ISBN, search by ISBN
      return this.searchBookByISBN(query);
    } else {
      // General search
      const url = `${baseBookApiUrl}?q=${encodeURIComponent(query)}`;
      return this.http.get<BookApiResponse>(url).pipe(
        map((response) => {
          return response.items?.map((item) => mapGoogleBookToCollectibleItem(item));
        })
      );
    }
  }

  searchBookByISBN(isbn: string): Observable<UserCollectibleItemDto[]> {
    const url = `${baseBookApiUrl}?q=isbn:${isbn}`;
    return this.http.get<BookApiResponse>(url).pipe(
      map((response) => {
        return response.items?.map((item) => mapGoogleBookToCollectibleItem(item));
      })      
    );
  }

}
