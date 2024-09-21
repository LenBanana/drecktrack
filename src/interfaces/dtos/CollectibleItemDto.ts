export enum CollectibleStatus {
    NotStarted,
    InProgress,
    Completed,
    OnHold,
    Dropped
  }
  
  // BookFormat enum (if applicable)
  export enum BookFormat {
    Hardcover,
    Paperback,
    Ebook,
    Audiobook
  }

  export interface UserCollectibleItemDtoPagination {
    items: UserCollectibleItemDto[];
    totalItems: number;
    pageSize: number;
    pageNumber: number;
  }

  export interface AddUserCollectibleItemDto {
    status: CollectibleStatus;
    userRating?: number;
    notes: string;
    dateStarted?: Date;
    dateCompleted?: Date;
    collectibleItem: CollectibleItemDto | BookDto | MovieDto | ShowDto;
  }

  export interface UserCollectibleItemDto extends AddUserCollectibleItemDto {
    collectibleItemId: string;
  }

  export interface CollectibleItemDto {
    id: string | undefined;
    title: string;
    description: string;
    releaseDate?: Date;
    endDate?: Date;
    language?: string;
    genres?: string[];
    tags?: string[];
    coverImageUrl?: string;
    averageRating?: number;
    ratingsCount?: number;
    externalIds?: ExternalIdDto[];
    itemType: 'Book' | 'Movie' | 'Show' | 'Music' | 'Game';
  }
  
  export interface ExternalIdDto {
    source: string;
    identifier: string;
  }

  export interface BookDto extends CollectibleItemDto {
    authors?: string[];
    publisher?: string;
    pageCount?: number;
    currentPage?: number;
    format?: BookFormat;
  }
  
  export interface MovieDto extends CollectibleItemDto {
    duration?: number;
  }

  export interface ShowDto extends CollectibleItemDto {
    seasons: SeasonDto[];
    status: string;
  }

  export interface SeasonDto {
    name: string;
    seasonNumber: number;
    episodes: EpisodeDto[];
    releaseDate?: Date;
    description?: string;
  }

  export interface EpisodeDto {
    name: string;
    watched: boolean;
    episodeNumber: number;
    releaseDate?: Date;
    description?: string;
    duration?: number;
  }