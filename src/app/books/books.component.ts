import { Component, OnInit } from '@angular/core';
import { BookService } from './book-service/book.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, switchMap, tap } from 'rxjs';
import { Book } from '../../interfaces/book-search';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { BarcodeScannerComponent } from '../barcode-scanner/barcode-scanner.component';
import { CollectibleItemCardComponent } from '../book-card/book-card.component';
import { CollectibleItemStorageService } from './book-storage-service/book-storage.service';
import { UserCollectibleItemDto, CollectibleStatus, BookDto } from '../../interfaces/dtos/CollectibleItemDto';
import { Book as GoogleBook } from '../../interfaces/book-search';
import { UserCollectionService } from '../../storage/user-collection.service';
@Component({
  selector: 'app-books',
  standalone: true,
  imports: [BarcodeScannerComponent, CollectibleItemCardComponent, CommonModule, FormsModule, NgbTypeaheadModule, FontAwesomeModule, NgbPaginationModule],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent implements OnInit {
  searchTerm = '';
  selectedBooks: Book[] = [];
  savedBooks: UserCollectibleItemDto[] = [];
  page = 1;
  pageSize = 8;
  totalItems = 0;
  searching = false;
  searchFailed = false;
  clearIcon = faTimes;

  // Filter properties
  filterTerm = '';
  filterStatus: CollectibleStatus | undefined = undefined;
  statuses: CollectibleStatus[] = [
    CollectibleStatus.NotStarted,
    CollectibleStatus.InProgress,
    CollectibleStatus.Completed,
  ];
  
  // A switch that returns a string based on the status
  statusFormatter = (status: CollectibleStatus) => {
    switch (status) {
      case CollectibleStatus.NotStarted:
        return 'Not Started';
      case CollectibleStatus.InProgress:
        return 'In Progress';
      case CollectibleStatus.Completed:
        return 'Completed';
      default:
        return '';
    }
  }

  formatter = (book: Book) => book.volumeInfo?.title;

  constructor(
    private bookService: BookService,
    private bookStorageService: CollectibleItemStorageService,
    private userCollectionService: UserCollectionService
  ) {}

  ngOnInit() {
    // Load saved books on initialization
    this.loadSavedBooks();
  }

  loadSavedBooks() {
    this.userCollectionService.getUserCollection(this.filterStatus, this.filterTerm, this.page, this.pageSize).subscribe(
      (items) => {
        this.savedBooks = items.items;
        this.page = items.pageNumber;
        this.pageSize = items.pageSize;
        this.totalItems = items.totalItems;
      },
      (error) => {
        console.error('Error loading saved books:', error);
      }
    );
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadSavedBooks();
  }

  applyFilters() {
    this.page = 1;
    this.loadSavedBooks();
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap((term) =>
        term.length < 2
          ? of([])
          : this.bookService.searchBooks(term).pipe(
              tap(() => (this.searchFailed = false)),
              catchError(() => {
                this.searchFailed = true;
                return of([]);
              })
            )
      ),
      tap(() => (this.searching = false))
    );

  selectItem(event: NgbTypeaheadSelectItemEvent) {
    const selectedBook: Book = event.item;
    if (!this.selectedBooks.some((book) => book.id === selectedBook.id)) {
      this.selectedBooks.push(selectedBook);
    }
    this.searchTerm = '';
  }

  clearSelection(): void {
    this.selectedBooks = [];
    this.searchTerm = '';
  }

  // Handle scanned ISBNs from BarcodeScannerComponent
  onIsbnScanned(isbn: string) {
    this.fetchBookByISBN(isbn);
  }

  // Fetch book details by ISBN
  fetchBookByISBN(isbn: string) {
    // Check if the book is already selected
    if (this.savedBooks.some((item) => item.collectibleItem.externalIds?.some((id) => id.identifier === isbn))) {
      return;
    }

    this.bookService.searchBookByISBN(isbn).subscribe(
      (books) => {
        books.forEach((book) => {
          if (!this.selectedBooks.some((b) => b.id === book.id)) {
            this.selectedBooks.push(book);
          }
        });
      },
      (error) => {
        console.error('Error fetching book by ISBN:', error);
        this.searchFailed = true;
      }
    );
  }

  // Save a book to the collection
  saveBook(book: Book): void {
    this.bookStorageService.addToCollection(book).subscribe(
      () => {
        // Remove the book from the selected books
        this.selectedBooks = this.selectedBooks.filter(
          (b) => b.id !== book.id
        );
        // Reload the saved books
        this.loadSavedBooks();
      },
      (error) => {
        console.error('Error adding book to collection:', error);
        alert('Error adding book to your collection.');
      }
    );
  }

  // Delete a book from the collection
  deleteBook(bookId: string): void {
    this.userCollectionService.removeItemFromCollection(bookId).subscribe(
      () => {
        // Reload the saved books
        this.loadSavedBooks();
      },
      (error) => {
        console.error('Error removing book from collection:', error);
        alert('Error removing book from your collection.');
      }
    );
  }

  onFilterChange() {
    this.applyFilters();
  }

  // Check if a book is in the collection
  inCollection(book: Book): boolean {
    return this.savedBooks.some((item) => item.collectibleItemId === book.id);
  }

  // Get the status of a book
  getBookStatus(book: Book): CollectibleStatus | undefined {
    const savedItem = this.savedBooks.find(
      (item) => item.collectibleItemId === book.id
    );
    return savedItem ? savedItem.status : undefined;
  }

  setTitle(title: string) {
    this.searchTerm = title;
  }
}