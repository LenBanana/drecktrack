import { SavedShow } from "./show";

export class ExportInfo {
    totalShows: number;
    totalEpisodes: number;
    totalWatched: number;
    totalUnwatched: number;
    totalRuntime: number;
    totalRuntimeString: string;
    totalSeasons: number;

    constructor(shows: SavedShow[]) {
        this.totalShows = shows.length;
        this.totalEpisodes = 0;
        this.totalWatched = 0;
        this.totalSeasons = 0;
        this.totalRuntime = 0;
        this.totalRuntimeString = '';

        shows.forEach(show => {
            this.totalSeasons += show.seasons.length;
            show.seasons.forEach(season => {
                this.totalEpisodes += season.episodes.length;
                this.totalRuntime += season.episodes.filter(episode => episode.watched).reduce((total, episode) => total + episode.runtime, 0);
                this.totalWatched += season.episodes.filter(episode => episode.watched).length;
            });
        });

        this.totalUnwatched = this.totalEpisodes - this.totalWatched;

        // Total runtime is in minutes, convert to hours and minutes if over 60 minutes
        if (this.totalRuntime >= 60) {
            const hours = Math.floor(this.totalRuntime / 60);
            const minutes = this.totalRuntime % 60;
            this.totalRuntime = hours;
            this.totalRuntimeString = `${hours}h ${minutes}m`;
        }
    }
}