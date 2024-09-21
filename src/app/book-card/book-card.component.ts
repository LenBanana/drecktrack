import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { faHourglassStart, faBookOpen, faCheckCircle, faGlasses } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookDto, CollectibleStatus, UserCollectibleItemDto } from '../../interfaces/dtos/CollectibleItemDto';
import { Book as GoogleBook } from '../../interfaces/book-search';
import { CollectibleItemStorageService } from '../books/book-storage-service/book-storage.service';
import { UserCollectionService } from '../../storage/user-collection.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ConfirmModalComponent],
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
})
export class CollectibleItemCardComponent {
  @Input() book!: GoogleBook | BookDto;
  @Input() inCollection: boolean = false;
  @Input() status?: CollectibleStatus;
  @Output() save = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() searchByTitle = new EventEmitter<string>();

  isOnMobile = window.innerWidth < 768;
  CollectibleStatus = CollectibleStatus;

  statuses: {
    label: string;
    value: CollectibleStatus;
    icon: any;
    btnClass: string;
    btnFillClass: string;
  }[] = [
      {
        label: '',
        value: CollectibleStatus.NotStarted,
        icon: faHourglassStart,
        btnClass: 'btn-outline-warning',
        btnFillClass: 'btn-warning',
      },
      {
        label: '',
        value: CollectibleStatus.InProgress,
        icon: faBookOpen,
        btnClass: 'btn-outline-primary',
        btnFillClass: 'btn-primary',
      },
      {
        label: '',
        value: CollectibleStatus.Completed,
        icon: faCheckCircle,
        btnClass: 'btn-outline-success',
        btnFillClass: 'btn-success',
      },
    ];

  // FontAwesome icons
  faHourglassStart = faHourglassStart;
  faBookOpen = faBookOpen;
  faCheckCircle = faCheckCircle;
  faGlasses = faGlasses;

  // Placeholder image URL
  placeholderImage = 'https://via.placeholder.com/128x196.png?text=No+Image';

  // Context menu properties
  showContextMenu = false;
  contextMenuPosition = { x: 0, y: 0 };

  constructor(
    private modalService: NgbModal,
    private bookStorageService: CollectibleItemStorageService,
    private userCollectionService: UserCollectionService
  ) {
    // Listen for window resize events
    window.addEventListener('resize', () => {
      this.isOnMobile = window.innerWidth < 768;
    });
  }

  // Helper methods to get properties from book
  getTitle(): string {
    if (this.isGoogleBook(this.book)) {
      return this.book.volumeInfo.title;
    } else {
      return this.book.title;
    }
  }

  getPageCount(): number | undefined {
    if (this.isGoogleBook(this.book)) {
      return this.book.volumeInfo.pageCount;
    } else {
      return this.book.pageCount;
    }
  }

  getCurrentPage(): number | undefined {
    if (this.isGoogleBook(this.book)) {
      return undefined;
    } else {
      return this.book.currentPage || 1;
    }
  }

  getAuthors(): string[] | undefined {
    if (this.isGoogleBook(this.book)) {
      return this.book.volumeInfo.authors;
    } else if ('authors' in this.book) {
      return this.book.authors;
    } else {
      return undefined;
    }
  }

  getDescription(): string | undefined {
    if (this.isGoogleBook(this.book)) {
      return this.book.volumeInfo.description;
    } else {
      return this.book.description;
    }
  }

  getSubtitle(): string | undefined {
    if (this.isGoogleBook(this.book)) {
      return this.book.volumeInfo.subtitle;
    } else {
      // Assuming subtitle is not available in CollectibleItemDto
      return undefined;
    }
  }

  getCoverImageUrl(): string {
    if (this.isGoogleBook(this.book)) {
      return (
        this.book.volumeInfo.imageLinks?.thumbnail ||
        this.book.volumeInfo.imageLinks?.smallThumbnail ||
        this.placeholderImage
      );
    } else {
      return this.book.coverImageUrl || this.placeholderImage;
    }
  }

  changeItem(status: CollectibleStatus | undefined) {
    if (this.isGoogleBook(this.book)) {
      return;
    }

    const bookId = this.book.id;
    if (!bookId) {
      return;
    }
    this.userCollectionService.getUserCollectibleItem(bookId).subscribe(userCollectible => {
      userCollectible.collectibleItem.itemType = "Book";
      userCollectible.collectibleItem = this.book as BookDto;
      status = status == undefined ? CollectibleStatus.NotStarted : status;
      this.userCollectionService.updateUserCollectibleItem(bookId, { ...userCollectible, status }).subscribe(
        () => {
          this.status = status;
        },
        (error) => {
          console.error('Error updating book status:', error);
          alert('Error updating book status.');
        }
      );
    });
  }

  changeCurrentPage(inputChange: Event) {
    if (this.isGoogleBook(this.book)) {
      return;
    }

    const element = inputChange.target as HTMLInputElement;
    var page = +element.value;
    if (!page || page < 1 || page > this.book.pageCount!) {
      (element.value as unknown as number) = this.book.currentPage || 1;
      return;
    }
    this.book.currentPage = page;
    this.changeItem(this.status);
  }

  // Type guard methods
  isGoogleBook(book: any): book is GoogleBook {
    return 'volumeInfo' in book;
  }

  // Handle right-click event
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    if (this.inCollection) {
      this.showContextMenu = true;
      this.contextMenuPosition = {
        x: event.clientX,
        y: event.clientY,
      };
    }
  }

  // Handle click on context menu option
  onContextMenuOption(action: string) {
    this.showContextMenu = false;
    if (action === 'remove') {
      this.confirmDelete();
    }
  }

  // Close context menu when clicking elsewhere
  @HostListener('document:click')
  onDocumentClick() {
    this.showContextMenu = false;
  }

  // Confirmation and deletion logic remains the same
  confirmDelete() {
    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Remove Book';
    modalRef.componentInstance.message =
      'Are you sure you want to remove this book from your collection?';

    modalRef.result.then(
      (result) => {
        if (result === 'confirmed') {
          this.delete.emit();
        }
      },
      (reason) => {
        // Dismissed
      }
    );
  }

  sendSearchByTitle() {
    this.searchByTitle.emit(this.getTitle());
  }
}
