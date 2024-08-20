import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SavedEpisode, SavedSeason, SavedShow } from '../../interfaces/show';
import { CommonModule } from '@angular/common';
import { faEye, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-episodes',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, MatMenuModule, FormsModule],
  templateUrl: './episodes.component.html',
  styleUrl: './episodes.component.scss'
})
export class EpisodesComponent {
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger!: MatMenuTrigger;
  @Input() season!: SavedSeason;
  @Output() episodeChanged: EventEmitter<SavedEpisode> = new EventEmitter<SavedEpisode>();
  @Output() deleteEpisode: EventEmitter<SavedEpisode> = new EventEmitter<SavedEpisode>();

  @ViewChild("episodeNameInput") episodeNameInput!: ElementRef;

  faEye = faEye;  
  faPen = faPen;
  faTrash = faTrash;
  menuTopLeftPosition = { x: '0', y: '0' }
  selectedEpisode!: SavedEpisode;

  constructor() {}

  setWatched(episode: SavedEpisode) {
    if (episode.renaming) return;

    episode.watched = !episode.watched;
    this.episodeChanged.emit(episode);    
  }

  rename() {
    this.selectedEpisode.renaming = true;
    setTimeout(() => {
      this.episodeNameInput.nativeElement.focus();
      this.episodeNameInput.nativeElement.select();
    }, 0);
  }

  delete() {
    this.deleteEpisode.emit(this.selectedEpisode);
  }

  saveName() {
    this.selectedEpisode.renaming = false;
    this.episodeChanged.emit(this.selectedEpisode);
  }

  onRightClick(event: MouseEvent, episode: SavedEpisode) {
    event.preventDefault();
    this.selectedEpisode = episode;
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    this.matMenuTrigger.openMenu();
  }
}
