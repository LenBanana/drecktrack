import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { concatMap, map, Observable, of } from 'rxjs';
import { AddUserCollectibleItemDto, BookDto, CollectibleStatus, MovieDto, ShowDto, UserCollectibleItemDto, UserCollectibleItemDtoPagination } from '../interfaces/dtos/CollectibleItemDto';
import { ShowService } from '../app/items/show-service/show.service';

@Injectable({
  providedIn: 'root'
})
export class UserCollectionService {
  private baseUrl = 'https://localhost:44327/api/UserCollection';
  headers = new HttpHeaders().set('X-Intercept', 'true');

  constructor(private http: HttpClient, private showService: ShowService) {}

  getUserCollection(itemType: 'Book' | 'Movie' | 'Show', status: CollectibleStatus | undefined, filterTerm: string | undefined, page: number, pageSize: number): Observable<UserCollectibleItemDtoPagination> {
    var apiUrl = `${this.baseUrl}?`;
    if (itemType) {
      apiUrl += `itemType=${itemType}&`;
    }
    if (status) {
      apiUrl += `status=${status}&`;
    }
    if (filterTerm) {
      apiUrl += `filterTerm=${filterTerm}&`;
    }
    apiUrl += `pageNumber=${page}&pageSize=${pageSize}`;
  
    return this.http.get<UserCollectibleItemDtoPagination>(apiUrl, { headers: this.headers }).pipe(
      map(response => {
        // Iterate over each item and determine the specific type
        response.items = response.items.map(item => {
          switch (item.collectibleItem.itemType.toLowerCase()) {
            case 'book':
              return { ...item, collectibleItem: item.collectibleItem as BookDto };
            case 'movie':
              return { ...item, collectibleItem: item.collectibleItem as MovieDto };
            case 'show':
              return { ...item, collectibleItem: item.collectibleItem as ShowDto };
            default:
              return item;
          }
        });
        return response;
      })
    );
  }
  

  getUserCollectibleItem(itemId: string): Observable<UserCollectibleItemDto> {
    return this.http.get<UserCollectibleItemDto>(`${this.baseUrl}/${itemId}`, { headers: this.headers });
  }

  addItemToCollection(item: AddUserCollectibleItemDto): Observable<any> {
    switch (item.collectibleItem.itemType.toLowerCase()) {
      case 'book':
        item.collectibleItem = item.collectibleItem as BookDto;
        return this.http.post(`${this.baseUrl}`, item, { headers: this.headers });
      case 'movie':
        item.collectibleItem = item.collectibleItem as MovieDto;
        return this.http.post(`${this.baseUrl}`, item, { headers: this.headers });
      case 'show':
        console.log('Adding item to collection:', item);
        item.collectibleItem = item.collectibleItem as ShowDto;
        // Fetch show seasons
        const ident = item.collectibleItem.externalIds?.pop();
        if (!ident) {
          return this.http.post(`${this.baseUrl}`, item, { headers: this.headers });
        }
        return this.showService.searchSeasons(ident.identifier).pipe(
          map(seasons => {
            console.log('Seasons:', seasons);
            (item.collectibleItem as ShowDto).seasons = seasons;
            return item;
          }),
          concatMap(updatedItem => this.http.post(`${this.baseUrl}`, updatedItem, { headers: this.headers }))
        );
      default:
        return of(null);
    }
  }

  updateUserCollectibleItem(itemId: string, item: Partial<UserCollectibleItemDto>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${itemId}`, item, { headers: this.headers });
  }

  removeItemFromCollection(itemId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${itemId}`, { headers: this.headers });
  }
}
