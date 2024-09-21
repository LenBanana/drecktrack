import { Routes } from '@angular/router';
import { SeasonsComponent } from './seasons/seasons.component';
import { MainComponent } from './main/main.component';
import { AuthGuard } from './auth-modal/auth-service/auth.guard';
import { AppComponent } from './app.component';

export const routes: Routes = [
    {        
        path: '', component: AppComponent,
    },
    {
        path: 'home', component: MainComponent, canActivate: [AuthGuard]
    },
    {
        path: 'show/:id', component: SeasonsComponent, canActivate: [AuthGuard]
    }
];
