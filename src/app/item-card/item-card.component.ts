import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { faHourglassStart, faBookOpen, faCheckCircle, faGlasses } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookDto, CollectibleItemDto, CollectibleStatus, MovieDto, ShowDto, UserCollectibleItemDto } from '../../interfaces/dtos/CollectibleItemDto';
import { UserCollectionService } from '../../storage/user-collection.service';
import { statuses } from './utils/item-utils';
import { BookCardComponent } from "./book-card/book-card.component";
import { ShowCardComponent } from "./show-card/show-card.component";

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ConfirmModalComponent, BookCardComponent, ShowCardComponent],
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss'],
})
export class CollectibleItemCardComponent {
  @Input() item!: CollectibleItemDto;
  @Input() inCollection: boolean = false;
  @Input() status?: CollectibleStatus;
  @Output() save = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() searchByTitle = new EventEmitter<string>();

  // Type guards
  isBook(item: CollectibleItemDto): item is BookDto {
    return item.itemType === 'Book';
  }
  isMovie(item: CollectibleItemDto): item is MovieDto {
    return item.itemType === 'Movie';
  }
  isShow(item: CollectibleItemDto): item is ShowDto {
    return item.itemType === 'Show';
  }

  statuses = statuses;

  isOnMobile = window.innerWidth < 768;
  CollectibleStatus = CollectibleStatus;

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
    private userCollectionService: UserCollectionService
  ) {
    // Listen for window resize events
    window.addEventListener('resize', () => {
      this.isOnMobile = window.innerWidth < 768;
    });
  }

  changeItem(status: CollectibleStatus | undefined) {
    const itemId = this.item.id;
    if (!itemId) {
      return;
    }
    this.userCollectionService.getUserCollectibleItem(itemId).subscribe(userCollectible => {
      userCollectible.collectibleItem.itemType = this.item.itemType;

      switch (this.item.itemType) {
        case 'Book':
          userCollectible.collectibleItem = this.item as BookDto;
          break;
        case 'Movie':
          userCollectible.collectibleItem = this.item as MovieDto;
          break;
        case 'Show':
          userCollectible.collectibleItem = this.item as ShowDto;
          break;
      }
      status = status == undefined ? CollectibleStatus.NotStarted : status;
      this.userCollectionService.updateUserCollectibleItem(itemId, { ...userCollectible, status }).subscribe(
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
    if (!this.isBook(this.item)) {
      return;
    }

    const element = inputChange.target as HTMLInputElement;
    var page = +element.value;
    if (!page || page < 1 || page > this.item.pageCount!) {
      (element.value as unknown as number) = this.item.currentPage || 1;
      return;
    }
    this.item.currentPage = page;
    this.changeItem(this.status);
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
    modalRef.componentInstance.title = 'Remove Item';
    modalRef.componentInstance.message =
      'Are you sure you want to remove this item from your collection?';

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
    this.searchByTitle.emit(this.item.title);
  }
}
