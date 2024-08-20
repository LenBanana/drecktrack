import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SavedEpisode, SavedSeason, SavedShow } from '../../interfaces/show';
import { CommonModule } from '@angular/common';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-episodes',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './episodes.component.html',
  styleUrl: './episodes.component.scss'
})
export class EpisodesComponent {
  @Input() season!: SavedSeason;
  @Output() watched: EventEmitter<SavedEpisode> = new EventEmitter<SavedEpisode>();

  faEye = faEye;

  constructor() {}

  setWatched(episode: SavedEpisode) {
    episode.watched = !episode.watched;
    this.watched.emit(episode);    
  }
}
