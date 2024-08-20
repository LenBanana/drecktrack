import { TestBed } from '@angular/core/testing';

import { ShowStorageService } from './storage.service';

describe('StorageService', () => {
  let service: ShowStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShowStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
