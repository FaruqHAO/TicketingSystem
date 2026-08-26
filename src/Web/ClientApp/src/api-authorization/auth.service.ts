import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { API_BASE_URL, CurrentUserResponse, LoginRequest, RegisterRequest, UsersClient } from '../app/web-api-client';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated.asObservable();

  private readonly _user = signal<CurrentUserResponse | null>(null);

  /**
   * The caller as the server describes them. Populated by the app initializer before
   * the first route resolves, so guards can read it synchronously.
   */
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user()?.isAuthenticated === true);
  readonly email = computed(() => this._user()?.email ?? null);
  /** Role names, e.g. 'Administrator'. Drives which dashboard the SPA shows. */
  readonly roles = computed<readonly string[]>(() => this._user()?.roles ?? []);
  /**
   * Server-side permissions (`Permissions.Tickets.Create` style). These are for hiding
   * actions the server would refuse anyway — they are not the UI route keys, which
   * RolePermissionService derives from roles.
   */
  readonly serverPermissions = computed<readonly string[]>(() => this._user()?.permissions ?? []);

  constructor(
    private usersClient: UsersClient,
    private http: HttpClient,
    @Inject(API_BASE_URL) private baseUrl: string
  ) {}

  initialize(): Observable<boolean> {
    // Prime the antiforgery cookies before probing auth state so any authenticated user landing
    // on a fresh page load already has a token for subsequent mutations.
    return this.refreshAntiforgeryToken().pipe(switchMap(() => this.loadCurrentUser()));
  }

  login(email: string, password: string): Observable<void> {
    return this.usersClient.login(true, undefined, new LoginRequest({ email, password })).pipe(
      // Antiforgery tokens are bound to the authenticated identity, so refresh after the identity changes.
      switchMap(() => this.refreshAntiforgeryToken()),
      // Roles and permissions arrive with the identity; re-read them before routing onward.
      switchMap(() => this.loadCurrentUser()),
      map(() => void 0)
    );
  }

  register(email: string, password: string): Observable<void> {
    return this.usersClient.register(new RegisterRequest({ email, password }));
  }

  logout(): Observable<void> {
    return this.usersClient.logout({}).pipe(
      switchMap(() => this.refreshAntiforgeryToken()),
      tap(() => this.setUser(null)),
      map(() => void 0)
    );
  }

  /**
   * Reads the caller's identity, roles and permissions. The endpoint answers 200 with
   * `isAuthenticated: false` for anonymous callers rather than 401, so a signed-out
   * visitor on the landing page does not trip the interceptor's login redirect.
   */
  private loadCurrentUser(): Observable<boolean> {
    return this.usersClient.getCurrentUser().pipe(
      catchError(() => of(null)),
      tap(user => this.setUser(user)),
      map(() => this.isAuthenticated())
    );
  }

  private setUser(user: CurrentUserResponse | null): void {
    this._user.set(user?.isAuthenticated ? user : null);
    this._isAuthenticated.next(this.isAuthenticated());
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
