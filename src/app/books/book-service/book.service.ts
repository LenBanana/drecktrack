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

  async extractISBN(image: File): Promise<BookSearch[] | null> {
    try {
      const result = await Tesseract.recognize(image, 'eng', {
        logger: (m) => console.log(m) // Optional: Log progress
      });

      // Clean up OCR output: remove unexpected characters, fix common issues
      let cleanedText = result.data.text
        .replace(/ISBN[-\s]*13[:-]/gi, 'ISBN-13:')  // Normalize ISBN-13 formatting
        .replace(/ISBN[-\s]*10[:-]/gi, 'ISBN-10:')  // Normalize ISBN-10 formatting
        .replace(/[;:]/g, ':')                      // Replace semicolons with colons
        .replace(/[-]+/g, '-')                      // Reduce multiple hyphens to one
        .replace(/[^a-zA-Z0-9\s:-]/g, '')           // Remove unexpected characters
        .replace(/\s+/g, ' ');                      // Normalize multiple spaces to one


      // Log all text found in the image
      console.log('Text found in image:', cleanedText);

      const isbnRegex = /\d{1,3}-\d{1,3}-\d{5,6}-\d{1,2}(-\d{0,1})?/g;
      const matches = cleanedText.match(isbnRegex);

      console.log('Matches:', matches);

      // Select the first valid ISBN found
      let selectedISBN = null;
      if (matches) {
        selectedISBN = matches.find((isbn) => isbn.length >= 10);
      }

      if (!selectedISBN) {
        console.error('No valid ISBN found after cleaning');
        return null;
      }

      console.log('Selected ISBN:', selectedISBN);

      return new Promise((resolve, reject) => {
        this.searchBookByISBN(selectedISBN).subscribe({
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

  searchBookByISBN(isbn: string): Observable<BookSearch[]> {
    const url = `${baseBookApiUrl}${isbn}`;
    return this.http.get<BookSearch[]>(url);
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