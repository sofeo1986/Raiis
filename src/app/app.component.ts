import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { SupaService } from './service/supa.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HomeComponent,NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Backtesting';
  session: any;
  isLoggedIn: boolean = false;

  constructor(private authService:SupaService,private router:Router){
    this.session = this.authService.getSession();
    this.isLoggedIn = this.authService.isLoggedIn();

}
}
