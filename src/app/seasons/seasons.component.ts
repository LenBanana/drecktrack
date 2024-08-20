import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faEye } from '@fortawesome/free-solid-svg-icons';
import { ShowStorageService } from '../../storage/storage.service';
import { SavedEpisode, SavedSeason, SavedShow } from '../../interfaces/show';
import { CommonModule } from '@angular/common';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { EpisodesService } from '../episodes/episodes-service/episodes.service';
import { placeholderImage } from '../../config/configs';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { EpisodesComponent } from "../episodes/episodes.component";

@Component({
  selector: 'app-seasons',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, NgbAccordionModule, MatMenuModule, EpisodesComponent],
  templateUrl: './seasons.component.html',
  styleUrl: './seasons.component.scss'
})
export class SeasonsComponent {
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger!: MatMenuTrigger;
  faArrowLeft = faArrowLeft;
  faEye = faEye;

  id: string = '';
  show!: SavedShow;
  selectedSeason!: SavedSeason;
  menuTopLeftPosition = { x: '0', y: '0' }

  constructor(private route: ActivatedRoute, private router: Router, private storageService: ShowStorageService, private episodeService: EpisodesService) {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      const show = this.storageService.getShow(this.id);

      if (show) {
        show.seasons.forEach(season => {
          if (typeof season.id === 'number' && season.episodes.length === 0) {
            this.episodeService.searchEpisodes(season.id).subscribe(episodes => {
              episodes.forEach(episode => {
                season.episodes.push({
                  id: episode.id,
                  name: episode.name,
                  description: episode.summary,
                  image: episode.image?.medium ?? placeholderImage,
                  watched: false
                });
              });
            });
          }
        });

        this.show = show;
      }
    });
  }

  saveWatchedEpisode(episode: SavedEpisode) {
    this.storageService.saveShow(this.show);
  }

  setAllWatched() {
    const allWatched = this.selectedSeason.episodes.every(episode => episode.watched);

    this.selectedSeason.episodes.forEach(episode => {
      episode.watched = !allWatched;
    });

    this.storageService.saveShow(this.show);
  }

  allWatched(season: SavedSeason): boolean {
    return season.episodes.every(episode => episode.watched);
  }

  onRightClick(event: MouseEvent, season: SavedSeason) {
    event.preventDefault();
    this.selectedSeason = season;
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    this.matMenuTrigger.openMenu();
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
