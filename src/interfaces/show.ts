export class ShowShare {
    shareId: string;
    shows: SavedShow[];

    constructor(shareId: string, shows: SavedShow[]) {
        this.shareId = shareId;
        this.shows = shows;
    }
}

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
        if (season.episodes.length > 0) {
            season.episodes.forEach(episode => {
                total++;
                if (episode.watched) {
                    watched++;
                }
            })
        } else { total += season.premiered ? season.episodeCount : 0; }
    });

    return total === 0 ? 0 : Math.round((watched / total) * 100);
}

export class SavedSeason {
    id: number | string;
    name: string;
    description: null | string;
    image: string;
    episodes: SavedEpisode[];
    episodeCount: number;
    premiered: boolean;
    deleting: boolean = false;

    constructor(id: number | string, name: string, description: null | string, image: string, episodes: SavedEpisode[], episodeCount: number, premiered: boolean) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.image = image;
        this.episodes = episodes;
        this.episodeCount = episodeCount;
        this.premiered = premiered;
    }
}

export class SavedEpisode {
    id: number | string;
    name: string;
    description: null | string;
    image: string;
    watched: boolean;
    renaming: boolean = false;
    runtime: number;

    constructor(id: number | string, name: string, description: null | string, image: string, watched: boolean, runtime: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.image = image;
        this.watched = watched;
        this.runtime = runtime;
    }
}