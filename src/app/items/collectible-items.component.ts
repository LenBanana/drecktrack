import { Component, Input, OnInit } from '@angular/core';
import { BookService } from './book-service/book.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, switchMap, tap } from 'rxjs';
import { faFilter, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { BarcodeScannerComponent } from '../barcode-scanner/barcode-scanner.component';
import { CollectibleItemCardComponent } from '../item-card/item-card.component';
import { CollectibleItemStorageService } from './item-storage-service/item-storage.service';
import { UserCollectibleItemDto, CollectibleStatus } from '../../interfaces/dtos/CollectibleItemDto';
import { UserCollectionService } from '../../storage/user-collection.service';
import { MovieService } from './movie-service/movie.service';
import { ShowService } from './show-service/show.service';
import { statusFormatter } from '../../utils/general-utils';
@Component({
  selector: 'app-collectible-items',
  standalone: true,
  imports: [BarcodeScannerComponent, CollectibleItemCardComponent, CommonModule, FormsModule, NgbTypeaheadModule, FontAwesomeModule, NgbPaginationModule],
  templateUrl: './collectible-items.component.html',
  styleUrl: './collectible-items.component.scss'
})
export class CollectibleItemsComponent implements OnInit {
  // Item type determines which service to use for searching
  @Input() currentItemType: 'Book' | 'Movie' | 'Show' = 'Book';

  searchTerm = '';
  selectedItems: UserCollectibleItemDto[] = [];
  savedItems: UserCollectibleItemDto[] = [];
  page = 1;
  pageSize = 8;
  totalItems = 0;
  searching = false;
  searchFailed = false;
  clearIcon = faTimes;  
  searchIcon = faSearch;
  filterIcon = faFilter;

  isMobile = window.innerWidth < 768;

  // Filter properties
  filterTerm = '';
  filterStatus: CollectibleStatus | undefined = undefined;
  statuses: CollectibleStatus[] = [
    CollectibleStatus.NotStarted,
    CollectibleStatus.InProgress,
    CollectibleStatus.Completed,
  ];

  statusFormatter = (status: CollectibleStatus) => statusFormatter(status);

  formatter = (item: UserCollectibleItemDto) => item?.collectibleItem?.title || '';

  constructor(
    private bookService: BookService,
    private movieService: MovieService,
    private showService: ShowService,
    private itemStorageService: CollectibleItemStorageService,
    private userCollectionService: UserCollectionService
  ) {}

  ngOnInit() {
    this.loadSavedItems();

    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });
  }

  loadSavedItems() {
    this.userCollectionService.getUserCollection(this.currentItemType, this.filterStatus, this.filterTerm, this.page, this.pageSize).subscribe(
      (items) => {
        this.savedItems = items.items;
        this.page = items.pageNumber;
        this.pageSize = items.pageSize;
        this.totalItems = items.totalItems;
      },
      (error) => {
        console.error('Error loading saved items:', error);
      }
    );
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadSavedItems();
  }

  applyFilters() {
    this.page = 1;
    this.loadSavedItems();
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap((term) => {
        if (term.length < 2) {
          return of([]);
        }
  
        let searchObservable: Observable<UserCollectibleItemDto[]>;
  
        switch (this.currentItemType) {
          case 'Book':
            searchObservable = this.bookService.searchBooks(term);
            break;
          case 'Show':
            searchObservable = this.showService.searchShows(term);
            break;
          // Add more cases here for other item types in the future
          default:
            searchObservable = of([]);
        }
  
        return searchObservable.pipe(
          tap(() => (this.searchFailed = false)),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          })
        );
      }),
      tap(() => (this.searching = false))
    );
  

  selectItem(event: NgbTypeaheadSelectItemEvent) {
    const selectedItem: UserCollectibleItemDto = event.item;
    if (!this.selectedItems.some((item) => item.collectibleItemId === selectedItem.collectibleItemId)) {
      this.selectedItems.push(selectedItem);
    }
    this.searchTerm = '';
  }

  clearSelection(): void {
    this.selectedItems = [];
    this.searchTerm = '';
  }

  // Handle scanned ISBNs from BarcodeScannerComponent
  onIsbnScanned(isbn: string) {
    this.fetchBookByISBN(isbn);
  }

  // Fetch book details by ISBN
  fetchBookByISBN(isbn: string) {
    // Check if the book is already selected
    if (this.savedItems.some((item) => item.collectibleItem.externalIds?.some((id) => id.identifier === isbn))) {
      return;
    }

    this.bookService.searchBookByISBN(isbn).subscribe(
      (books) => {
        books.forEach((book) => {
          if (!this.selectedItems.some((b) => b.collectibleItem.id === book.collectibleItem.id)) {
            this.selectedItems.push(book);
          }
        });
      },
      (error) => {
        console.error('Error fetching book by ISBN:', error);
        this.searchFailed = true;
      }
    );
  }

  // Save a item to the collection
  saveItem(item: UserCollectibleItemDto): void {
    this.itemStorageService.addToCollection(item).subscribe(
      () => {
        // Remove the item from the selected items
        this.selectedItems = this.selectedItems.filter(
          (b) => b.collectibleItemId !== item.collectibleItemId
        );
        // Reload the saved items
        this.loadSavedItems();
      },
      (error) => {
        console.error('Error adding item to collection:', error);
        alert('Error adding item to your collection.');
      }
    );
  }

  // Delete a item from the collection
  deleteBook(itemId: string | undefined): void {
    if (!itemId) {
      return;
    }
    this.userCollectionService.removeItemFromCollection(itemId).subscribe(
      () => {
        // Reload the saved items
        this.loadSavedItems();
      },
      (error) => {
        console.error('Error removing item from collection:', error);
        alert('Error removing item from your collection.');
      }
    );
  }

  onFilterChange() {
    this.applyFilters();
  }

  // Check if a item is in the collection
  inCollection(userItem: UserCollectibleItemDto): boolean {
    return this.savedItems.some((item) => userItem.collectibleItemId === item.collectibleItemId);
  }

  // Get the status of a item
  getItemStatus(item: UserCollectibleItemDto): CollectibleStatus | undefined {
    const savedItem = this.savedItems.find(
      (item) => item.collectibleItemId === item.collectibleItemId
    );
    return savedItem ? savedItem.status : undefined;
  }

  setTitle(title: string) {
    this.searchTerm = title;
  }
}