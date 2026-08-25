import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

// Requests using these methods are safe/idempotent and do not require an antiforgery token.
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

@Injectable({
  providedIn: 'root'
})
export class AuthorizeInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Send the auth cookie with every API call.
    let authReq = req.clone({ withCredentials: true });

    // Echo the JS-readable XSRF-TOKEN cookie into the X-XSRF-TOKEN header on mutating requests.
    // Angular's built-in XSRF interceptor deliberately skips absolute URLs, and the generated API
    // client emits absolute (API_BASE_URL-based) URLs, so we attach the header ourselves.
    if (!SAFE_METHODS.includes(req.method.toUpperCase())) {
      const token = this.readCookie('XSRF-TOKEN');
      if (token && !authReq.headers.has('X-XSRF-TOKEN')) {
        authReq = authReq.clone({ setHeaders: { 'X-XSRF-TOKEN': token } });
      }
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse
          && error.status === 401
          && !error.url?.includes('/manage/info')
          && !this.router.url.startsWith('/login')) {
          this.router.navigate(['/login'], { queryParams: { returnUrl: window.location.pathname } });
        }
        return throwError(() => error);
      })
    );
  }

  private readCookie(name: string): string | null {
    const escaped = name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1');
    const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }
}
