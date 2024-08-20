import { Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, map, merge, Observable, of, OperatorFunction, Subject, Subscription, switchMap } from 'rxjs';
import { NgbPaginationModule, NgbTypeahead, NgbTypeaheadModule, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
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
import { KonamiService } from '../../konami/konami.service';


@Component({
  selector: 'app-shows',
  standalone: true,
  imports: [RouterOutlet, SeriesComponent, NgbTypeaheadModule, FormsModule, JsonPipe, CommonModule, FontAwesomeModule, NgbPaginationModule],
  templateUrl: './shows.component.html',
  styleUrl: './shows.component.scss'
})
export class ShowsComponent implements OnDestroy {

@ViewChild('instance', { static: true }) instance!: NgbTypeahead;

subscriptions = new Subscription();
selectedShows: SavedShow[] = [];
seriesSearch: SeriesSearch | string = '';
seriesSearches: SeriesSearch[] = [];
searchTimeout: any;
focus$ = new Subject<string>();
click$ = new Subject<string>();

faAdd = faAdd;

// Pagination
page = 1;
pageSize = 5;

constructor(public seriesService: SeriesService, public storageService: ShowStorageService, public konamiService: KonamiService) {
  this.selectedShows = storageService.getShows();
  this.subscriptions.add(this.konamiService.konamiCodeEnteredSubject.subscribe(() => {
    storageService.exportJsonAsFile();
  }));
}

ngOnDestroy() {
  console.log('ngOnDestroy');
  this.subscriptions.unsubscribe();
}

search: OperatorFunction<string, readonly SeriesSearch[]> = (text$: Observable<string>) => {
  const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
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

selectItem(item: NgbTypeaheadSelectItemEvent<SeriesSearch>) {
  this.seriesSearch = item.item;
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
  if (typeof this.seriesSearch !== 'string') {
    return;
  }

  const searchTerm = this.seriesSearch.trim();
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
  if (typeof this.seriesSearch === 'string') {
    show.id = crypto.randomUUID();
    show.name = this.seriesSearch;
    show.image = placeholderImage;
  } else {
    show.id = this.seriesSearch.show.id;
    show.name = this.seriesSearch.show.name;
    show.description = this.seriesSearch.show.summary;
    show.image = this.seriesSearch.show.image.original;
  }

  this.seriesSearch = '';
  if (this.storageService.exists(show)) {
    alert('Show already exists in your list');
    return;
  }

  this.selectedShows.push(show);
  this.storageService.saveShow(show);
}

removeShow(show: SavedShow) {
  this.selectedShows = this.selectedShows.filter(s => s.id !== show.id);
}
}
