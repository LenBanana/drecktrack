import { Injectable } from '@angular/core';
import { SavedShow } from '../interfaces/show';

@Injectable({
  providedIn: 'root'
})
export class ShowStorageService {

  constructor() { }

  key = 'savedShows';

  saveShow(show: SavedShow) {
    const shows = this.getShows();
    const idx = shows.findIndex(s => s.id === show.id);

    if (idx === -1) {
      shows.push(show);
    } else {
      shows[idx] = show;
    }

    localStorage.setItem(this.key, JSON.stringify(shows));
  }

  exists(show: SavedShow): boolean {
    const shows = this.getShows();
    return shows.some(s => s.id === show.id);
  }

  getShows(): SavedShow[] {
    const shows = localStorage.getItem(this.key);
    return shows ? JSON.parse(shows) : [];
  }

  getShow(id: string): SavedShow | undefined {
    const shows = this.getShows();
    return shows.find(s => s.id.toString() === id.toString());
  }

  removeShow(show: SavedShow) {
    const shows = this.getShows();
    const index = shows.findIndex(s => s.id === show.id);
    shows.splice(index, 1);
    localStorage.setItem(this.key, JSON.stringify(shows));
  }
}
