import { Routes } from '@angular/router';
import { authGuard } from './Guard/auth.guard';
import { HomeComponent } from './component/home/home.component';
import { DashbordComponent } from './component/dashbord/dashbord.component';
import { CreatePortfolioComponent } from './component/create-portfolio/create-portfolio.component';

export const routes: Routes = [
    {path:'',loadComponent:()=>import('./component/login/login.component').then((com)=>com.LoginComponent)},

    {path:'login',loadComponent:()=>import('./component/login/login.component').then((com)=>com.LoginComponent)},
    {path:'signup',loadComponent:()=>import('./component/signup/signup.component').then((sig)=>sig.SignupComponent)},

    {path:'admin',component:HomeComponent,canActivate:[authGuard],children:[
    {path:'dashbord',component:DashbordComponent,canActivate:[authGuard]},
    {path:'create_portfolio',component:CreatePortfolioComponent,canActivate:[authGuard]},
]
    }
];