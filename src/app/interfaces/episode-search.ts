export interface EpisodeSearch {
    id:       number;
    url:      string;
    name:     string;
    runtime:  number;
    image:    Image;
    summary:  string;
}

export interface Image {
    medium:   string;
    original: string;
}
