import { Component } from '@angular/core';
import { BookSearch } from '../../interfaces/book-search';
import { BookService } from './book-service/book.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { faFileImage, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbTypeaheadModule, FontAwesomeModule],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent {
  isbnTerm = '9783551749697';
  selectedBook: BookSearch | null = null;
  savedBooks: BookSearch[] = [];
  errorMessage: string | null = null;
  bookUserId = '';

  searchIcon = faMagnifyingGlass;
  fileSearchIcon = faFileImage;

  constructor(private bookService: BookService) {
    this.bookUserId = bookService.getUserId();

    this.bookService.getSavedBooks().subscribe((books) => {
      this.savedBooks = books;
    }, (error) => {
      console.error('Error fetching books:', error);
    });
  }

  // Trigger ISBN search when user types
  isbnTextSearch(): void {
    if (this.isbnTerm.length >= 10) {
      this.bookService.searchBookByISBN(this.isbnTerm).subscribe((bookSearch) => {
        this.selectedBook = bookSearch;
        this.errorMessage = null;
      }, (error) => {
        console.error('Error searching for ISBN:', error);
        this.errorMessage = 'Failed to search for the ISBN.';
        this.selectedBook = null;
      });
    }
  }

  // Handle file input for image-based ISBN search
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.bookService.extractISBN(file).then((bookSearch) => {
        if (bookSearch) {
          this.selectedBook = bookSearch;
          this.errorMessage = null;
        } else {
          this.errorMessage = 'No book details found.';
          this.selectedBook = null;
        }
      }).catch((error) => {
        console.error('Error processing file:', error);
        this.errorMessage = 'Failed to process the image.';
        this.selectedBook = null;
      });
    }
  }

  // Handle item selection from the ISBN search results
  onISBNSelected(event: any): void {
    this.selectedBook = event.item;
  }

  addBook(): void {
    if (this.selectedBook) {
      console.log('Adding book:', this.selectedBook);
      this.bookService.saveBook(this.selectedBook).subscribe((bookSearch) => {
        if (this.selectedBook) {
          this.selectedBook.saved = true;
          this.savedBooks.push(this.selectedBook);
        }
      }, (error) => {
        console.error('Error saving book:', error);
      });
    }
  }

  removeBook(book: BookSearch): void {
    this.bookService.deleteBook(book.id).subscribe(() => {
      this.savedBooks = this.savedBooks.filter((b) => b.isbn13 !== book.isbn13);
    }, (error) => {
      console.error('Error removing book:', error);
    });
  }

  inCollection(book: BookSearch): boolean {
    return this.savedBooks.some((b) => b.isbn13 === book.isbn13 || b.isbn10 === book.isbn10);
  }

  notInCollection(book: BookSearch): boolean {
    return !this.savedBooks.some((b) => b.isbn13 === book.isbn13 || b.isbn10 === book.isbn10);
  }
}