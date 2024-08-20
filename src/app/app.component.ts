import { Component } from '@angular/core';
import {  NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterOutlet } from '@angular/router';
import { SeriesComponent } from './series/series.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SeriesComponent, NgbTypeaheadModule, FormsModule, JsonPipe, CommonModule, FontAwesomeModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor() {}
}
