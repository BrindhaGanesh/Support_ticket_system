import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  tickets: any[] = [];
  loading = true;
  searchTerm = '';
  selectedStatus = '';
  isAdmin = false;
  userName = '';

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.userName = localStorage.getItem('name') || '';
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketService.getTickets(this.selectedStatus, this.searchTerm).subscribe({
      next: (data) => {
        this.tickets = [...data];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void { this.loadTickets(); }
  onStatusChange(): void { this.loadTickets(); }

  updateStatus(id: number, status: string): void {
    this.ticketService.updateStatus(id, status).subscribe({
      next: () => this.loadTickets()
    });
  }

  logout(): void { this.authService.logout(); }

  getStatusClass(status: string): string {
    const map: any = { 'Open': 'badge-open', 'InProgress': 'badge-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' };
    return map[status] || '';
  }

  getPriorityClass(priority: string): string {
    const map: any = { 'High': 'priority-high', 'Medium': 'priority-medium', 'Low': 'priority-low' };
    return map[priority] || '';
  }
}