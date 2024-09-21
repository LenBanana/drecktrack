import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BookDto } from '../../../interfaces/dtos/CollectibleItemDto';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss'
})
export class BookCardComponent {
  @Input() item!: BookDto;
  @Output() changeCurrentPage = new EventEmitter<number>();

  faBookOpen = faBookOpen;

  constructor() { }

  changePage(inputEvent: Event) {
    const target = inputEvent.target as HTMLInputElement;
    const pageValue = parseInt(target.value);
  
    // If input is empty, not a number, or outside the valid range, reset to current page
    if (!target.value || isNaN(pageValue) || pageValue < 1 || pageValue > this.item.pageCount) {
      target.value = this.item.currentPage.toString();
      return;
    }
  
    this.changeCurrentPage.emit(pageValue);
  } 
  
}
