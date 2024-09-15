import { Routes } from '@angular/router';
import { SeasonsComponent } from './seasons/seasons.component';
import { MainComponent } from './main/main.component';

export const routes: Routes = [
    {        
        path: '', component: MainComponent,
    },
    {
        path: 'show/:id', component: SeasonsComponent
    }
];
