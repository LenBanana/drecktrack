import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SeasonsService } from '../seasons/seasons-service/seasons.service';
import { getProgress, SavedShow } from '../interfaces/show';
import { ShowStorageService } from '../helper/storage.service';
import { placeholderImage } from '../config/configs';
import { SeasonsComponent } from "../seasons/seasons.component";
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [NgbTypeaheadModule, FormsModule, JsonPipe, CommonModule, FontAwesomeModule, SeasonsComponent, MatMenuModule, RouterModule],
  templateUrl: './series.component.html',
  styleUrl: './series.component.scss'
})
export class SeriesComponent implements OnChanges {
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger!: MatMenuTrigger;
  @Input() show!: SavedShow;
  @Output() remove = new EventEmitter<SavedShow>();

  getProgress = getProgress;

  menuTopLeftPosition = { x: '0', y: '0' }
  faTrash = faTrash;
  faEye = faEye;

  constructor(public seasonsService: SeasonsService, public storageService: ShowStorageService, public router: Router) { }

  ngOnChanges() {
    if (typeof this.show.id === 'string' || this.show.seasons.length > 0) {
      return;
    }

    this.seasonsService.searchSeasons(this.show.id).subscribe(seasons => {
      seasons.forEach(season => {
        this.show.seasons.push(
          {
            id: season.id,
            name: season.name,
            description: season.summary,
            image: season.image?.medium ?? placeholderImage,
            episodes: []
          }
        );

        this.storageService.saveShow(this.show);
      });
    });
  }

  async openShow() {
    // Navigate to relative route for the show
    await this.router.navigate(['show', this.show.id]);
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    this.matMenuTrigger.openMenu();
  }

  removeShow() {
    this.storageService.removeShow(this.show);
    this.remove.emit(this.show);
  }
}
