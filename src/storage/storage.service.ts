import { Injectable } from '@angular/core';
import { SavedShow } from '../interfaces/show';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShowStorageService {

  showsOverwritten: Subject<SavedShow[]> = new Subject<SavedShow[]>();

  constructor() { }

  key = 'savedShows';
  shareKey = 'sharedShows';

  getShareId(): string {
    const id = localStorage.getItem(this.shareKey);
    if (id) {
      return id.toUpperCase();
    }
    const newId = Math.random().toString(36).substring(2).toUpperCase();
    localStorage.setItem(this.shareKey, newId);
    return newId;
  }

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

  saveShows(shows: SavedShow[]) {
    localStorage.setItem(this.key, JSON.stringify(shows));
    this.showsOverwritten.next(shows);
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

  getJson() {
    const shows = this.getShows();
    return JSON.stringify(shows, null, 2);
  }

  copyToClipboard(): SavedShow[] {
    const data = this.getJson();
    navigator.clipboard.writeText(data);
    return JSON.parse(data);
  }

  async getFromClipboard(): Promise<SavedShow[]> {
    const datas = await navigator.clipboard.readText().then(data => {
      try {
        const shows = JSON.parse(data);
        if (Array.isArray(shows) && shows.every(s => s.id && s.name && s.seasons)) {
          return shows;
        } else {
          alert('Invalid data');
        }
      } catch (e) {
        alert('Invalid data');
      }
      return [];
    });
    return datas;
  }

  exportJsonAsFile() {
    const data = this.getJson();
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
