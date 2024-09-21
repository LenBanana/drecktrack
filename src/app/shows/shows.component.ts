import { Component, OnDestroy, signal, ViewChild, WritableSignal } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, map, merge, Observable, of, OperatorFunction, Subject, Subscription, switchMap } from 'rxjs';
import { NgbPaginationModule, NgbToastModule, NgbTypeahead, NgbTypeaheadModule, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { RouterOutlet } from '@angular/router';
import { SeriesService } from '../series/series-service/series.service';
import { ShowStorageService } from '../../storage/storage.service';
import { SeriesComponent } from '../series/series.component';
import { SavedShow } from '../../interfaces/show';
import { SeriesSearch } from '../../interfaces/series-search';
import { placeholderImage } from '../../config/configs';
import { BooksComponent } from "../books/books.component";


@Component({
  selector: 'app-shows',
  standalone: true,
  imports: [RouterOutlet, SeriesComponent, NgbTypeaheadModule, FormsModule, JsonPipe, CommonModule, FontAwesomeModule, NgbPaginationModule, NgbToastModule],
  templateUrl: './shows.component.html',
  styleUrl: './shows.component.scss'
})
export class ShowsComponent implements OnDestroy {

  @ViewChild('instance', { static: true }) instance!: NgbTypeahead;

  subscriptions = new Subscription();
  selectedShows: SavedShow[] = [];
  seriesSearch: WritableSignal<SeriesSearch | string> = signal('');
  seriesSearches: SeriesSearch[] = [];
  searchTimeout: any;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  faAdd = faAdd;

  // Pagination
  page = 1;
  pageSize = 5;

  constructor(public seriesService: SeriesService, public storageService: ShowStorageService) {
    this.selectedShows = storageService.getShows();

    storageService.showsOverwritten.subscribe((shows) => {
      this.selectedShows = shows;
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  search: OperatorFunction<string, readonly SeriesSearch[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      switchMap(term => {
        if (term === '') {
          return of(this.seriesSearches);
        }
        return this.seriesService.searchSeries(term).pipe(
          map(seriesSearches => seriesSearches)
        );
      })
    );
  };

  filterSelectedShows(term: string | SeriesSearch): SavedShow[] {
    if (typeof term === 'string') {
      return this.selectedShows.filter(s => s.name.toLowerCase().includes(term.toLowerCase()));
    }

    return this.selectedShows.filter(s => s.id === term.show.id);
  }

  selectItem(item: NgbTypeaheadSelectItemEvent<SeriesSearch>) {
    this.seriesSearch.set(item.item);
    this.saveSeriesSearch();
  }

  liveSearchSeries(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchSeries();
    }, 500);
  }

  formatter = (x: SeriesSearch) => x.show?.name;

  searchSeries(): void {
    if (typeof this.seriesSearch() !== 'string') {
      return;
    }

    const searchTerm = (this.seriesSearch() as string).trim();
    if (searchTerm.length < 2) {
      this.seriesSearches = [];
      return;
    }

    this.seriesService.searchSeries(searchTerm).subscribe((data) => {
      if (data) {
        this.seriesSearches = data;
      }
    });
  }

  saveSeriesSearch() {
    let show: SavedShow = new SavedShow();
    if (typeof this.seriesSearch() === 'string') {
      if ((this.seriesSearch() as string).length < 1) {
        return;
      }

      show.id = crypto.randomUUID();
      show.name = this.seriesSearch() as string;
      show.image = placeholderImage;
    } else {
      const series = this.seriesSearch() as SeriesSearch;
      show.id = series.show.id;
      show.name = series.show.name;
      show.description = series.show.summary;
      show.image = series.show.image.original;
    }

    this.seriesSearch.set('');
    if (this.storageService.exists(show)) {
      alert('Show already exists in your list');
      return;
    }

    this.selectedShows.push(show);
    this.storageService.saveShow(show);
  }

  removeShow(show: SavedShow) {
    this.selectedShows = this.selectedShows.filter(s => s.id !== show.id);
    this.storageService.removeShow(show);

    if (this.page > 1 && this.selectedShows.length % this.pageSize === 0) {
      this.page--;
    }
  }
}
