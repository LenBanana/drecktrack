import { Injectable } from '@angular/core';
import { baseApiUrl } from '../../config/configs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EpisodeSearch } from '../../interfaces/episode-search';

@Injectable({
  providedIn: 'root'
})
export class EpisodesService {

  private apiUrl = baseApiUrl + 'seasons/';

  constructor(private http: HttpClient) { }

  searchEpisodes(id: number): Observable<EpisodeSearch[]> {
    const url = `${this.apiUrl}${id}/episodes`;
    return this.http.get<EpisodeSearch[]>(url);
  }
}