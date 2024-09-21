import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ShowDto } from '../../../interfaces/dtos/CollectibleItemDto';
import { CommonModule } from '@angular/common';
import { faTv } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-show-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './show-card.component.html',
  styleUrl: './show-card.component.scss'
})
export class ShowCardComponent {
  @Input() item!: ShowDto;
  @Output() save = new EventEmitter<void>();

  faTv = faTv;
}
