import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EpisodeDto, SeasonDto, UserCollectibleItemDto } from '../../../interfaces/dtos/CollectibleItemDto';
import { ShowSearch } from '../../../interfaces/series-search';
import { mapExternalShowToCollectibleItem, maxExternalEpisodeToDto, maxExternalSeasonsToDto } from '../../../utils/show-utils';
import { SeasonSearch } from '../../../interfaces/season-search';
import { EpisodeSearch } from '../../../interfaces/episode-search';

export const baseShowApiUrl = 'https://api.tvmaze.com/search/shows';
export const baseSeasonApiUrl = 'https://api.tvmaze.com/shows';
export const baseEpisodeApiUrl = 'https://api.tvmaze.com/seasons';

@Injectable({
  providedIn: 'root'
})
export class ShowService {

  constructor(private http: HttpClient) { }

  searchShows(query: string): Observable<UserCollectibleItemDto[]> {    
      const url = `${baseShowApiUrl}?q=${encodeURIComponent(query)}`;
      return this.http.get<ShowSearch[]>(url).pipe(
        map((response) => {
          return mapExternalShowToCollectibleItem(response);
        })
      );    
  }

  searchSeasons(id: string): Observable<SeasonDto[]> {
    const url = `${baseSeasonApiUrl}/${id}/seasons`;
    return this.http.get<SeasonSearch[]>(url).pipe(
      map((response) => {
        return maxExternalSeasonsToDto(response);
      })
    ); 
  }

  searchEpisodes(id: string): Observable<EpisodeDto[]> {
    const url = `${baseEpisodeApiUrl}/${id}/episodes`;
    return this.http.get<EpisodeSearch[]>(url).pipe(
      map((response) => {
        return maxExternalEpisodeToDto(response);
      })
    ); 
  }
}
