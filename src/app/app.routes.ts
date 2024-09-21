import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AuthGuard } from './auth-modal/auth-service/auth.guard';
import { AppComponent } from './app.component';
import { ShowDetailComponent } from './item-card/show-detail/show-detail.component';

export const routes: Routes = [
    {        
        path: '', component: AppComponent,
    },
    {
        path: 'home', component: MainComponent, canActivate: [AuthGuard]
    },
    { 
        path: 'show/:id', component: ShowDetailComponent , canActivate: [AuthGuard]
    },
];
