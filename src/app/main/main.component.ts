import { Component } from '@angular/core';
import { ShowsComponent } from "../shows/shows.component";
import { BooksComponent } from "../books/books.component";
import { faBook, faClapperboard, faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { AuthModalComponent } from "../auth-modal/auth-modal.component";
import { AuthService } from '../auth-modal/auth-service/auth.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [ShowsComponent, BooksComponent, FontAwesomeModule, CommonModule, AuthModalComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  movieIcon = faClapperboard;
  bookIcon = faBook;
  homeIcon = faHome;
  logoutIcon = faSignOutAlt;

  currectActiveTab = 'shows';

  constructor(private authService: AuthService) { }

  setActiveTab(tab: string) {
    this.currectActiveTab = tab;
  }

  logout() {
    // Logout the user
    this.authService.logout();
  }
}
