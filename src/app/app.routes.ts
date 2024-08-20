import { Routes } from '@angular/router';
import { SeasonsComponent } from './seasons/seasons.component';
import { ShowsComponent } from './shows/shows.component';

export const routes: Routes = [
    {        
        path: '', component: ShowsComponent,
    },
    {
        path: 'show/:id', component: SeasonsComponent
    }
];
