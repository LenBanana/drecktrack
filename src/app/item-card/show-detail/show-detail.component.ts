import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ShowDto,
  SeasonDto,
  CollectibleStatus,
  EpisodeDto,
} from '../../../interfaces/dtos/CollectibleItemDto';
import { UserCollectionService } from '../../../storage/user-collection.service';
import { ShowService } from '../../items/show-service/show.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { statusFormatter } from '../../../utils/general-utils';
import { faArrowLeft, faStar, faCalendarAlt, faTags, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-show-detail',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './show-detail.component.html',
  styleUrls: ['./show-detail.component.scss'],
  animations: [
    trigger('collapseAnimation', [
      state(
        'collapsed',
        style({
          height: '0',
          opacity: 0,
          overflow: 'hidden',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: 1,
          overflow: 'hidden',
        })
      ),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class ShowDetailComponent implements OnInit {
  showId!: string;
  show!: ShowDto;
  isLoading: boolean = true;
  errorMessage: string = '';

  // FontAwesome Icons
  faArrowLeft = faArrowLeft;
  faStar = faStar;
  faCalendarAlt = faCalendarAlt;
  faTags = faTags;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  isMobile = window.innerWidth < 768;

  CollectibleStatus = CollectibleStatus;

  constructor(
    private route: ActivatedRoute,
    private userCollectionService: UserCollectionService,
    private showService: ShowService
  ) {}

  ngOnInit(): void {
    this.showId = this.route.snapshot.paramMap.get('id')!;
    this.loadShowDetails();

    // Check if the window is resized to determine if we are on mobile
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });
  }

  /**
   * Navigate back to the previous page
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * Fetch show details from the user collection service
   */
  private loadShowDetails(): void {
    this.isLoading = true;
    this.userCollectionService.getUserCollectibleItem(this.showId).subscribe(
      (userCollectible) => {
        this.show = userCollectible.collectibleItem as ShowDto;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading show details:', error);
        this.errorMessage = 'Failed to load show details. Please try again later.';
        this.isLoading = false;
      }
    );
  }

  /**
   * Toggle the expansion of a season and load episodes if necessary
   * @param season The season to toggle
   */
  toggleSeason(season: SeasonDto): void {
    season.isExpanded = !season.isExpanded;
    if (season.isExpanded && (!season.episodes || season.episodes.length === 0)) {
      this.loadEpisodes(season);
    }
  }

  /**
   * Load episodes for a specific season
   * @param season The season for which to load episodes
   */
  private loadEpisodes(season: SeasonDto): void {
    if (!season.externalId || (season.episodes && season.episodes.length > 0)) {
      return;
    }
    this.showService.searchEpisodes(season.externalId).subscribe(
      (episodes) => {
        season.episodes = episodes;
        this.updateItem();
      },
      (error) => {
        console.error('Error loading episodes:', error);
        // Optionally, set an error message for the season
      }
    );
  }

  /**
   * Update the collectible item in the user collection
   */
  updateItem(): void {
    this.userCollectionService.changeItem(undefined, this.show);
  }

  /**
   * Get the display status of a season based on watched episodes
   * @param season The season to evaluate
   * @returns The formatted status string
   */
  getSeasonStatus(season: SeasonDto): string {
    if (!season.episodes || season.episodes.length === 0) {
      return statusFormatter(this.CollectibleStatus.NotStarted);
    }

    const watchedEpisodes = season.episodes.filter((episode) => episode.watched).length;

    if (watchedEpisodes === 0) {
      return statusFormatter(this.CollectibleStatus.NotStarted);
    } else if (watchedEpisodes === season.episodes.length) {
      return statusFormatter(this.CollectibleStatus.Completed);
    } else {
      return statusFormatter(this.CollectibleStatus.InProgress);
    }
  }

  /**
   * Calculate the progress percentage of watched episodes in a season
   * @param season The season to calculate progress for
   * @returns The progress percentage
   */
  getSeasonProgress(season: SeasonDto): number {
    if (!season.episodes || season.episodes.length === 0) {
      return 0;
    }
    const watched = season.episodes.filter((ep) => ep.watched).length;
    return Math.round((watched / season.episodes.length) * 100);
  }

  /**
   * Calculate the average rating of the show if available
   * @returns The average rating or 'N/A'
   */
  get averageRating(): string {
    return this.show.averageRating
      ? `${this.show.averageRating.toFixed(1)} / 10`
      : 'N/A';
  }

  /**
   * Get formatted release date
   * @returns The release date as a string or 'Unknown'
   */
  get releaseDate(): string {
    return this.show.releaseDate
      ? new Date(this.show.releaseDate).toLocaleDateString()
      : 'Unknown';
  }

  /**
   * Get formatted genres
   * @returns A comma-separated string of genres or 'N/A'
   */
  get genres(): string {
    return this.show.genres && this.show.genres.length > 0
      ? this.show.genres.join(', ')
      : 'N/A';
  }
}
