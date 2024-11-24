import { Component, HostListener, OnInit } from '@angular/core';
import { SupaService } from '../../service/supa.service';
import { Router, RouterModule } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import this
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ RouterModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
  session: any;
  constructor(private authService:SupaService,private router:Router){


}
isSidebarActive: boolean = true;
  isDashboardActive: boolean = true;
  isPortfolioActive: boolean = false; // By default, since you set this to be active in the markup


  // Toggle the sidebar
  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
    console.log('Sidebar active:', this.isSidebarActive); // Debug

  }

  // Activate a menu item based on the section clicked
  activateMenu(menuItem: string) {
    if (menuItem === 'dashboard') {
      this.isDashboardActive = true;
      this.isPortfolioActive = false;
      localStorage.setItem('activeMenu', 'dashboard');

    } else if (menuItem === 'portfolio') {
      this.isDashboardActive = false;
      this.isPortfolioActive = true;
      localStorage.setItem('activeMenu', 'portfolio');

    }
  }
ngOnInit() {
  this.session = this.authService.getSession();
  console.log(this.session)
  this.autoRefreshSession();
  const activeMenu = localStorage.getItem('activeMenu');
    if (activeMenu === 'portfolio') {
      this.isDashboardActive = false;
      this.isPortfolioActive = true;
    } else {
      this.isDashboardActive = true;
      this.isPortfolioActive = false;
    }
    this.checkScreenWidth(); // Vérifiez la largeur à l'initialisation

  
}


@HostListener('window:resize', [])
onResize() {
  this.checkScreenWidth(); // Vérifiez à chaque redimensionnement
}

checkScreenWidth() {
  const width = window.innerWidth;
  if (width > 768) {
    this.isSidebarActive = true; // Assurez-vous que la sidebar est visible en desktop
  } else {
    this.isSidebarActive = false; // Cachez la sidebar en mobile par défaut
  }
}

async onSignOut() {
  const { error } = await this.authService.signOut();
  if (!error) {
    console.log('User signed out');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('activeMenu'); // Clear stored menu on signout

    this.router.navigate(['/login'])
  }
 

}
private async autoRefreshSession() {
setInterval(async () => {
  try {
    await this.authService.refreshSession();
    console.log('Session refreshed');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Session refresh error:', error.message);
    } else {
      console.error('Session refresh error:', error);
    }
  }
}, 1 * 60 * 1000); // Refresh every 15 minutes
}
}
