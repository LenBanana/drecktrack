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
  @Output() save = new EventEmitter<void>();

  faBookOpen = faBookOpen;
}
