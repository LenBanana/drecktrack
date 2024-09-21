import { UserCollectibleItemDto, CollectibleStatus, ShowDto, ExternalIdDto, SeasonDto, EpisodeDto } from "../interfaces/dtos/CollectibleItemDto";
import { EpisodeSearch } from "../interfaces/episode-search";
import { SeasonSearch } from "../interfaces/season-search";
import { ShowSearch } from "../interfaces/series-search";

export function mapExternalShowToCollectibleItem(showSearchArray: ShowSearch[]): UserCollectibleItemDto[] {
    return showSearchArray.map(showSearch => {
        const show = showSearch.show;

        // Parse the release date
        let releaseDate: Date | undefined;
        if (show.premiered) {
            releaseDate = new Date(show.premiered);
        }

        // Parse the end date
        let endDate: Date | undefined;
        if (show.ended) {
            endDate = new Date(show.ended);
        }

        // Create the ShowDto
        const showDto: ShowDto = {
            id: undefined, // Leave this undefined; the backend will assign an ID
            title: show.name,
            description: show.summary || '',
            releaseDate: releaseDate,
            endDate: endDate,
            language: '', // Assuming language is not provided in the Show object
            genres: show.genres || [],
            tags: [], // You can add additional tags if needed
            coverImageUrl: show.image?.medium || show.image?.original || '',
            averageRating: show.rating.average || undefined,
            ratingsCount: undefined, // Assuming ratings count is not provided in the Show object
            externalIds: [show.id.toString()].map(id => ({ source: 'TVmaze', identifier: id })),
            itemType: 'Show',
            status: show.status,
            seasons: [],
        };

        // Create the UserCollectibleItemDto
        const userCollectibleItem: UserCollectibleItemDto = {
            collectibleItemId: crypto.randomUUID(),
            status: CollectibleStatus.NotStarted, // Default status; adjust as needed
            // Optionally, set other properties like userRating, notes, etc.
            collectibleItem: showDto,
            notes: 'Add your notes here...',
        };

        return userCollectibleItem;
    });
}

export function maxExternalSeasonsToDto(seasonSearch: SeasonSearch[]): SeasonDto[] {
    return seasonSearch.map(season => {
        const seasonDto: SeasonDto = {
            id: undefined,
            showId: undefined,
            name: season.name,
            externalId: season.id.toString(),
            seasonNumber: season.number,
            episodes: [],
            releaseDate: season.premiereDate ? new Date(season.premiereDate) : undefined,
            description: season.summary || '',
        };

        return seasonDto;
    });
}

export function maxExternalEpisodeToDto(episodeSearch: EpisodeSearch[]): EpisodeDto[] {
    return episodeSearch.map(episode => {
        const episodeDto: EpisodeDto = {
            id: undefined,
            seasonId: undefined,
            name: episode.name,
            externalId: episode.id.toString(),
            watched: false,
            episodeNumber: episode.number,
            duration: episode.runtime,
            releaseDate: episode.airdate ? new Date(episode.airdate) : undefined,
            description: episode.summary || '',
        };

        return episodeDto;
    });
}