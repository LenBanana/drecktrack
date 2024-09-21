import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import { Book, BookApiResponse } from '../../../interfaces/book-search';

export const baseBookApiUrl = 'https://www.googleapis.com/books/v1/volumes';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(private http: HttpClient) { }

  searchBooks(query: string): Observable<Book[]> {
    const isbnRegex = /^(97(8|9))?\d{9}(\d|X)$/;
    if (isbnRegex.test(query.replace(/-/g, ''))) {
      // If it's an ISBN, search by ISBN
      return this.searchBookByISBN(query);
    } else {
      // General search
      const url = `${baseBookApiUrl}?q=${encodeURIComponent(query)}`;
      return this.http.get<BookApiResponse>(url).pipe(
        map(response => response.items || [])
      );
    }
  }

  searchBookByISBN(isbn: string): Observable<Book[]> {
    const url = `${baseBookApiUrl}?q=isbn:${isbn}`;
    return this.http.get<BookApiResponse>(url).pipe(
      map(response => response.items || [])
    );
  }

}
