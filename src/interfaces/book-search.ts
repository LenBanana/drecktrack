export interface BookApiResponse {
    kind: string;
    totalItems: number;
    items: Book[];
}

export interface Book {
    kind: string;
    id: string;
    etag: string;
    selfLink: string;
    volumeInfo: VolumeInfo;
    saleInfo?: SaleInfo;
    accessInfo?: AccessInfo;
    searchInfo?: SearchInfo;
}

export interface VolumeInfo {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: IndustryIdentifier[];
    readingModes?: ReadingModes;
    pageCount?: number;
    printType?: string;
    categories?: string[];
    maturityRating?: string;
    allowAnonLogging?: boolean;
    contentVersion?: string;
    panelizationSummary?: PanelizationSummary;
    imageLinks?: ImageLinks;
    language?: string;
    previewLink?: string;
    infoLink?: string;
    canonicalVolumeLink?: string;
}

export interface IndustryIdentifier {
    type: string;
    identifier: string;
}

export interface ReadingModes {
    text: boolean;
    image: boolean;
}

export interface PanelizationSummary {
    containsEpubBubbles: boolean;
    containsImageBubbles: boolean;
}

export interface ImageLinks {
    smallThumbnail?: string;
    thumbnail?: string;
}

export interface SaleInfo {
    // Add fields if needed
}

export interface AccessInfo {
    // Add fields if needed
}

export interface SearchInfo {
    textSnippet: string;
}
