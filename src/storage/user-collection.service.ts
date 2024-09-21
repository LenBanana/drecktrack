import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AddUserCollectibleItemDto, BookDto, CollectibleStatus, MovieDto, ShowDto, UserCollectibleItemDto, UserCollectibleItemDtoPagination } from '../interfaces/dtos/CollectibleItemDto';

@Injectable({
  providedIn: 'root'
})
export class UserCollectionService {
  private baseUrl = 'https://localhost:44327/api/UserCollection';
  headers = new HttpHeaders().set('X-Intercept', 'true');

  constructor(private http: HttpClient) {}

  getUserCollection(status: CollectibleStatus | undefined, filterTerm: string | undefined, page: number, pageSize: number): Observable<UserCollectibleItemDtoPagination> {
    var apiUrl = `${this.baseUrl}?`;
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
    return this.http.post(`${this.baseUrl}`, item, { headers: this.headers });
  }

  updateUserCollectibleItem(itemId: string, item: Partial<UserCollectibleItemDto>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${itemId}`, item, { headers: this.headers });
  }

  removeItemFromCollection(itemId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${itemId}`, { headers: this.headers });
  }
}
