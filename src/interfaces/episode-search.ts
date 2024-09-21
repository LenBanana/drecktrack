export interface EpisodeSearch {
    id:       number;
    url:      string;
    name:     string;
    number:   number;
    runtime:  number;
    image:    Image;
    summary:  string;
    airdate:  string;
}

export interface Image {
    medium:   string;
    original: string;
}
