import { Component, OnInit, ViewChild } from '@angular/core';
import { SupaService } from '../../service/supa.service';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './dashbord.component.html',
  styleUrls: ['./dashbord.component.css'] // Corrected styleUrl to style**s**Url
})
export class DashbordComponent implements OnInit {
  session: any;

  constructor(private authService: SupaService, private router: Router) { }

  ngOnInit() {
    this.session = this.authService.getSession();
    console.log(this.session);
    this.autoRefreshSession();
  }

  async onSignOut() {
    const { error } = await this.authService.signOut();
    if (!error) {
      console.log('User signed out');
      localStorage.removeItem('supabase.auth.token');
      this.router.navigate(['/login']);
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
    }, 1 * 60 * 1000); // Refresh every 1 minute
  }

  // Bar Chart Configuration
  btnClick () {
    this.router.navigate(['admin/create_portfolio']);
};
}
