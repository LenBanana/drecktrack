import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export const baseMovieApiUrl = 'https://api.tvmaze.com/search/shows?q=';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  constructor(private http: HttpClient) { }

  searchMovies(query: string) {
    const url = `${baseMovieApiUrl}${query}`;
    return this.http.get(url);
  }
}
