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

  exportJsonAsFile() {
    const shows = this.getShows();
    const data = JSON.stringify(shows, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shows.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  importJsonFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      const shows = JSON.parse(data);
      if (Array.isArray(shows) && shows.every(s => s.id && s.name && s.seasons)) {
        localStorage.setItem(this.key, data);
      } else {
        alert('Invalid file');
      }
    };
    reader.readAsText(file);
  }
}
