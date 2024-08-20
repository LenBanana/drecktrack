import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SeasonsService } from '../seasons/seasons-service/seasons.service';
import { getProgress, SavedSeason, SavedShow } from '../../interfaces/show';
import { ShowStorageService } from '../../storage/storage.service';
import { placeholderImage, undoTimeout } from '../../config/configs';
import { SeasonsComponent } from "../seasons/seasons.component";
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { faAdd, faEye, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
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

  removeTimeout: any;
  menuTopLeftPosition = { x: '0', y: '0' }
  faTrash = faTrash;
  faEye = faEye;
  faAdd = faAdd;
  faPen = faPen;

  constructor(public seasonsService: SeasonsService, public storageService: ShowStorageService, public router: Router) { }

  ngOnChanges() {
    if (typeof this.show.id === 'string' || this.show.seasons.length > 0) {
      return;
    }

    this.seasonsService.searchSeasons(this.show.id).subscribe(seasons => {
      seasons.forEach(season => {
        this.show.seasons.push(new SavedSeason(
          season.id,
          season.name,
          season.summary,
          season.image?.medium ?? placeholderImage,
          []));

        this.storageService.saveShow(this.show);
      });
    });
  }

  async openShow() {
    if (this.show.deleting) {
      this.cancelDelete();
      return;
    }

    await this.router.navigate(['show', this.show.id]);
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    this.matMenuTrigger.openMenu();
  }

  addSeason() {
    this.show.seasons.push(new SavedSeason(
      crypto.randomUUID(),
      'New Season',
      '',
      placeholderImage,
      []
    ));

    this.storageService.saveShow(this.show);
  }

  saveName() {
    this.show.renaming = false;
    this.storageService.saveShow(this.show);
  }

  removeShow() {
    this.show.deleting = true;

    this.removeTimeout = setTimeout(() => {
      this.remove.emit(this.show);
    }, undoTimeout);
  }

  cancelDelete() {
    if (!this.show.deleting) {
      return;
    }

    this.show.deleting = false;
    clearTimeout(this.removeTimeout);
  }
}
