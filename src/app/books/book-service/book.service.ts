import { Injectable } from '@angular/core';
import { baseBookApiUrl } from '../../../config/configs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import Tesseract from 'tesseract.js';
import { BookSearch } from '../../../interfaces/book-search';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  constructor(private http: HttpClient) {
  }

  // Get userId from local storage
  getUserId(): string {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      const newUserId = Math.random().toString(36).substring(2);
      this.saveUserId(newUserId);
      return newUserId;
    }
    return userId;
  }

  saveUserId(userId: string): void {
    localStorage.setItem('userId', userId);
  }

  async extractISBN(image: File): Promise<BookSearch | null> {
    try {
      const result = await Tesseract.recognize(image, 'eng', {
        logger: (m) => console.log(m) // Optional: Log progress
      });

      // Log all text found in the image
      console.log('Text found in image:', result.data.text);

      const isbnRegex = /\bISBN[- ]?(?:97[89])?[- ]?\d{1,5}[- ]?\d{1,7}[- ]?\d{1,7}[- ]?\d\b/;
      const match = result.data.text.match(isbnRegex);
      if (!match) {
        console.error('No ISBN found in image');
        return null;
      }

      // Extract numbers from the match
      const isbn = match[0].replace(/\D/g, '');
      return new Promise((resolve, reject) => {
        this.searchBookByISBN(isbn).subscribe({
          next: (bookSearch) => resolve(bookSearch),
          error: (err) => {
            console.error('Error fetching book details:', err);
            resolve(null);
          }
        });
      });
      
    } catch (error) {
      console.error('Error during OCR processing:', error);
      return null;
    }
  }

  searchBookByISBN(isbn: string): Observable<BookSearch> {
    const url = `${baseBookApiUrl}${isbn}`;
    return this.http.get<BookSearch>(url);
  }  

  saveBook(book: BookSearch): Observable<BookSearch> {
    book.userId = this.getUserId();
    const url = `${baseBookApiUrl}/save-book`;
    return this.http.post<BookSearch>(url, book, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  getSavedBooks(): Observable<BookSearch[]> {
    const url = `${baseBookApiUrl}/saved-books/${this.getUserId()}`;
    return this.http.get<BookSearch[]>(url);
  }

  deleteBook(bookId: string): Observable<void> {
    const url = `${baseBookApiUrl}/delete-book/${bookId}/${this.getUserId()}`;
    return this.http.delete<void>(url);
  }
}