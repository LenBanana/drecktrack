export class SavedShow {
    id: number | string;
    name: string;
    description: null | string;
    image: string;
    seasons: SavedSeason[];
    deleting: boolean = false;
    renaming: boolean = false;

    constructor(id?: number | string, name?: string, description?: null | string, image?: string, seasons?: SavedSeason[]) {
        this.id = id ?? 0;
        this.name = name ?? '';
        this.description = description ?? '';
        this.image = image ?? '';
        this.seasons = seasons ?? [];
    }
}

export function getProgress(show: SavedShow): number {
    let watched = 0;
    let total = 0;

    show.seasons.forEach(season => {
        season.episodes.forEach(episode => {
            total++;
            if (episode.watched) {
                watched++;
            }
        });
    });

    return total === 0 ? 0 : Math.round((watched / total) * 100);
}

export class SavedSeason {
    id: number | string;
    name: string;
    description: null | string;
    image: string;
    episodes: SavedEpisode[];
    deleting: boolean = false;

    constructor(id: number | string, name: string, description: null | string, image: string, episodes: SavedEpisode[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.image = image;
        this.episodes = episodes;
    }
}

export class SavedEpisode {
    id: number | string;
    name: string;
    description: null | string;
    image: string;
    watched: boolean;
    renaming: boolean = false;

    constructor(id: number | string, name: string, description: null | string, image: string, watched: boolean) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.image = image;
        this.watched = watched;
    }
}