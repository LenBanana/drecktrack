import { Injectable } from '@angular/core';
import { baseApiUrl } from '../../../config/configs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SeriesSearch } from '../../../interfaces/series-search';

@Injectable({
  providedIn: 'root'
})
export class SeriesService {

  private apiUrl = baseApiUrl + 'search/shows?q=';

  constructor(private http: HttpClient) { }

  searchSeries(query: string): Observable<SeriesSearch[]> {
    const url = `${this.apiUrl}${query}`;
    return this.http.get<SeriesSearch[]>(url);
  }
}