import { Injectable } from '@angular/core';
import { baseApiUrl } from '../../config/configs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SeasonSearch } from '../../interfaces/season-search';

@Injectable({
  providedIn: 'root'
})
export class SeasonsService {

  private apiUrl = baseApiUrl + 'shows/';

  constructor(private http: HttpClient) { }

  searchSeasons(id: number): Observable<SeasonSearch[]> {
    const url = `${this.apiUrl}${id}/seasons`;
    return this.http.get<SeasonSearch[]>(url);
  }
}