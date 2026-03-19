import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  loading = true;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('isAdmin:', this.authService.isAdmin());
    console.log('role from storage:', localStorage.getItem('role'));

    if (!this.authService.isAdmin()) {
      this.router.navigate(['/tickets']);
      return;
    }

    this.ticketService.getStats().subscribe({
      next: (data) => {
        console.log('Stats received:', data);
        this.stats = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Stats error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void { this.authService.logout(); }
}