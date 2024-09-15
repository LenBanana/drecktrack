import { Component } from '@angular/core';
import { ShowsComponent } from "../shows/shows.component";
import { BooksComponent } from "../books/books.component";
import { faBook, faClapperboard, faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [ShowsComponent, BooksComponent, FontAwesomeModule, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  movieIcon = faClapperboard;
  bookIcon = faBook;
  homeIcon = faHome;

  currectActiveTab = 'shows';

  constructor() { }

  setActiveTab(tab: string) {
    this.currectActiveTab = tab;
  }
}
