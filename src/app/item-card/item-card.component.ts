import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { faHourglassStart, faBookOpen, faCheckCircle, faGlasses } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookDto, CollectibleItemDto, CollectibleStatus, MovieDto, ShowDto } from '../../interfaces/dtos/CollectibleItemDto';
import { UserCollectionService } from '../../storage/user-collection.service';
import { statuses } from './utils/item-utils';
import { BookCardComponent } from "./book-card/book-card.component";
import { ShowCardComponent } from "./show-card/show-card.component";
import { Router } from '@angular/router';

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
    private userCollectionService: UserCollectionService,
    private router: Router
  ) {
    // Listen for window resize events
    window.addEventListener('resize', () => {
      this.isOnMobile = window.innerWidth < 768;
    });
  }

  changeCurrentPage(newPage: number) {
    if (!this.isBook(this.item)) {
      return;
    }
    this.item.currentPage = newPage;
    this.changeItem(undefined);
  }

  changeItem(status: CollectibleStatus | undefined) {
    status = status == undefined ? this.status : status;
    this.status = status;
    this.userCollectionService.changeItem(status, this.item);
  }

  // Handle left-click event
  onItemClicked() {
    if (this.inCollection && this.isShow(this.item)) {
      this.router.navigate(['/show', this.item.id]);
    }
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
  onContextMenuOption(event: MouseEvent, action: string) {
    this.showContextMenu = false;
    event.preventDefault();
    event.stopPropagation();
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
