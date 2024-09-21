export interface ShowSearch {
    score: number;
    show:  Show;
}

export interface Show {
    id:             number;
    url:            string;
    name:           string;
    type:           string;
    genres:         string[];
    status:         Status;
    runtime:        number | null;
    averageRuntime: number | null;
    premiered:      Date | null;
    ended:          Date | null;
    rating:         Rating;
    image:          Image;
    summary:        string;
}

export interface Image {
    medium:   string;
    original: string;
}

export interface Rating {
    average: number | null;
}

export enum Status {
    Ended = "Ended",
    Running = "Running",
}