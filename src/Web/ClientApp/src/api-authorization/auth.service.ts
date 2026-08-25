import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { API_BASE_URL, LoginRequest, RegisterRequest, UsersClient } from '../app/web-api-client';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor(
    private usersClient: UsersClient,
    private http: HttpClient,
    @Inject(API_BASE_URL) private baseUrl: string
  ) {}

  initialize(): Observable<boolean> {
    // Prime the antiforgery cookies before probing auth state so any authenticated user landing
    // on a fresh page load already has a token for subsequent mutations.
    return this.refreshAntiforgeryToken().pipe(
      switchMap(() => this.usersClient.infoGET()),
      map(() => true),
      catchError(() => of(false)),
      tap(isAuth => this._isAuthenticated.next(isAuth))
    );
  }

  login(email: string, password: string): Observable<void> {
    return this.usersClient.login(true, undefined, new LoginRequest({ email, password })).pipe(
      // Antiforgery tokens are bound to the authenticated identity, so refresh after the identity changes.
      switchMap(() => this.refreshAntiforgeryToken()),
      tap(() => this._isAuthenticated.next(true)),
      map(() => void 0)
    );
  }

  register(email: string, password: string): Observable<void> {
    return this.usersClient.register(new RegisterRequest({ email, password }));
  }

  logout(): Observable<void> {
    return this.usersClient.logout({}).pipe(
      switchMap(() => this.refreshAntiforgeryToken()),
      tap(() => this._isAuthenticated.next(false)),
      map(() => void 0)
    );
  }

  /**
   * Fetches an antiforgery token. The server sets a JS-readable XSRF-TOKEN cookie (the request token)
   * alongside the HttpOnly antiforgery cookie; AuthorizeInterceptor echoes the former into the
   * X-XSRF-TOKEN header on mutating requests. Must be re-fetched whenever the authenticated identity
   * changes, since the token is bound to the user.
   */
  private refreshAntiforgeryToken(): Observable<unknown> {
    return this.http
      .get(`${this.baseUrl}/api/Users/antiforgery/token`, { responseType: 'text', withCredentials: true })
      .pipe(catchError(() => of(null)));
  }
}
