import { Injectable } from '@angular/core';
import { AddUserCollectibleItemDto, BookDto, CollectibleStatus, ExternalIdDto, UserCollectibleItemDto, UserCollectibleItemDtoPagination } from '../../../interfaces/dtos/CollectibleItemDto';
import { UserCollectionService } from '../../../storage/user-collection.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollectibleItemStorageService {
  constructor(private userCollectionService: UserCollectionService) { }

  addToCollection(collectibleItem: AddUserCollectibleItemDto): Observable<any> {
    return this.userCollectionService.addItemToCollection(collectibleItem);
  }  
}
