import { Book } from "../interfaces/book-search";
import { AddUserCollectibleItemDto, ExternalIdDto, BookDto, CollectibleStatus, UserCollectibleItemDto } from "../interfaces/dtos/CollectibleItemDto";


export function mapGoogleBookToCollectibleItem(book: Book): UserCollectibleItemDto {
    const volumeInfo = book.volumeInfo;

    // Map industry identifiers to ExternalIdDto
    let externalIds: ExternalIdDto[] = [];
    if (volumeInfo.industryIdentifiers) {
        externalIds = volumeInfo.industryIdentifiers.map((identifier) => ({
            source: identifier.type, // e.g., "ISBN_13", "ISBN_10"
            identifier: identifier.identifier,
        }));
    }

    // Map image links to get the cover image URL
    const coverImageUrl =
        volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '';

    // Parse the release date
    let releaseDate: Date | undefined;
    if (volumeInfo.publishedDate) {
        // Handle different date formats (e.g., "YYYY", "YYYY-MM", "YYYY-MM-DD")
        const dateParts = volumeInfo.publishedDate.split('-');
        const year = parseInt(dateParts[0], 10);
        const month = dateParts[1] ? parseInt(dateParts[1], 10) - 1 : 0; // Months are zero-based in JS
        const day = dateParts[2] ? parseInt(dateParts[2], 10) : 1;
        releaseDate = new Date(year, month, day);
    }

    // Create the CollectibleItemDto (specifically a BookDto)
    const bookDto: BookDto = {
        id: undefined, // Leave this undefined; the backend will assign an ID
        title: volumeInfo.title,
        description: volumeInfo.description || volumeInfo.subtitle || '',
        releaseDate: releaseDate,
        language: volumeInfo.language || '',
        genres: volumeInfo.categories || [],
        tags: [], // You can add additional tags if needed
        coverImageUrl: coverImageUrl,
        averageRating: undefined, // Google Books API doesn't provide average rating directly
        ratingsCount: undefined, // Google Books API doesn't provide ratings count directly
        externalIds: externalIds,
        itemType: 'Book',
        // Specific to books
        authors: volumeInfo.authors || [],
        publisher: volumeInfo.publisher || '',
        pageCount: volumeInfo.pageCount || 0,
        currentPage: 0,
        format: undefined, // Google Books API doesn't provide format directly
    };

    // Create the UserCollectibleItemDto
    const userCollectibleItem: UserCollectibleItemDto = {
        collectibleItemId: crypto.randomUUID(),
        status: CollectibleStatus.NotStarted, // Default status; adjust as needed
        // Optionally, set other properties like userRating, notes, etc.
        collectibleItem: bookDto,
        notes: 'Add your notes here...',
    };

    return userCollectibleItem;
}



  
export function mapExternalItemToCollectibleItem(item: any): AddUserCollectibleItemDto {
    switch (item.itemType) {
      case 'Book':
        return mapGoogleBookToCollectibleItem(item);
      case 'Movie':
        //return this.mapExternalMovieToCollectibleItem(item);
      case 'Show':
        //return this.mapExternalShowToCollectibleItem(item);
      default:
        throw new Error('Unsupported item type');
    }
  }