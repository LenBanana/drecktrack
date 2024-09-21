import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AuthGuard } from './auth-modal/auth-service/auth.guard';
import { AppComponent } from './app.component';

export const routes: Routes = [
    {        
        path: '', component: AppComponent,
    },
    {
        path: 'home', component: MainComponent, canActivate: [AuthGuard]
    }
];
