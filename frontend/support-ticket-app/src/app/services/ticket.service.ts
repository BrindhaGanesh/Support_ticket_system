import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private apiUrl = 'http://localhost:5000/api/tickets';

  constructor(private http: HttpClient) {}

  getTickets(status?: string, search?: string): Observable<any[]> {
  let params = new HttpParams();
  if (status) params = params.set('status', status);
  if (search) params = params.set('search', search);
  return this.http.get<any[]>(this.apiUrl, { params });
}

  createTicket(data: { title: string; description: string; priority: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}