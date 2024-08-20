export interface SeasonSearch {
    id:           number;
    url:          string;
    number:       number;
    name:         string;
    episodeOrder: number;
    premiereDate: Date;
    endDate:      Date;
    image:        Image;
    summary:      null | string;
}

export interface Image {
    medium:   string;
    original: string;
}