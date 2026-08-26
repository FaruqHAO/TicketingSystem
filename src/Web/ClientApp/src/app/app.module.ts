import { APP_ID, NgModule, inject, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
  ArrowRight,
  Check,
  ChartLine,
  FileText,
  Gauge,
  Headset,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  LucideAngularModule,
  Menu,
  Plus,
  ScrollText,
  Search,
  ShieldCheck,
  Ticket,
  Timer,
  Users,
  X
} from 'lucide-angular';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';
import { AdminDashboardComponent } from './dashboards/admin/admin-dashboard.component';
import { PeopleComponent } from './dashboards/admin/people.component';
import { AuditComponent } from './dashboards/admin/audit.component';
import { CustomerDashboardComponent } from './dashboards/customer/customer-dashboard.component';
import { MyTicketsComponent } from './dashboards/customer/my-tickets.component';
import { AgentDashboardComponent } from './dashboards/agent/agent-dashboard.component';
import { TicketPoolComponent } from './dashboards/agent/ticket-pool.component';
import { ManagerDashboardComponent } from './dashboards/manager/manager-dashboard.component';
import { AnalyticsComponent } from './dashboards/manager/analytics.component';
import { dashboardHomeRedirect, roleGuard } from './shared/guards/role.guard';
import { API_BASE_URL } from './web-api-client';
import { AuthorizeInterceptor } from 'src/api-authorization/authorize.interceptor';
import { LoginComponent } from 'src/api-authorization/login/login.component';
import { RegisterComponent } from 'src/api-authorization/register/register.component';
import { AuthService } from 'src/api-authorization/auth.service';

export function getApiBaseUrl(): string {
  const url = document.getElementsByTagName('base')[0].href;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    // Every glyph the app uses, registered once. `pick` keeps the rest of the set out
    // of the bundle, so this list has to grow when a template names a new icon.
    LucideAngularModule.pick({
      ArrowRight,
      Check,
      ChartLine,
      FileText,
      Gauge,
      Headset,
      Inbox,
      KeyRound,
      LayoutDashboard,
      LifeBuoy,
      LogOut,
      Menu,
      Plus,
      ScrollText,
      Search,
      ShieldCheck,
      Ticket,
      Timer,
      Users,
      X
    }),
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forbidden', component: ForbiddenComponent },

      // Role-agnostic entry point. Anything that just wants "the dashboard" — the home
      // page's call to action, a post-login redirect — links here and lands wherever
      // the viewer's role lives.
      { path: 'dashboard', pathMatch: 'full', redirectTo: dashboardHomeRedirect },

      // One route per page, each declaring the UI permission key it needs. `roleGuard`
      // reads `data.permission`, so adding a page is a route entry plus a key in
      // ROLE_PERMISSIONS — no change to the guard itself.
      {
        path: 'dashboard/admin',
        component: AdminDashboardComponent,
        canActivate: [roleGuard],
        data: { permission: 'admin-dashboard' }
      },
      {
        path: 'dashboard/admin/people',
        component: PeopleComponent,
        canActivate: [roleGuard],
        data: { permission: 'user-management' }
      },
      {
        path: 'dashboard/admin/audit',
        component: AuditComponent,
        canActivate: [roleGuard],
        data: { permission: 'audit-log' }
      },
      {
        path: 'dashboard/customer',
        component: CustomerDashboardComponent,
        canActivate: [roleGuard],
        data: { permission: 'customer-dashboard' }
      },
      {
        path: 'dashboard/customer/tickets',
        component: MyTicketsComponent,
        canActivate: [roleGuard],
        data: { permission: 'my-tickets' }
      },
      {
        path: 'dashboard/agent',
        component: AgentDashboardComponent,
        canActivate: [roleGuard],
        data: { permission: 'agent-dashboard' }
      },
      {
        path: 'dashboard/agent/pool',
        component: TicketPoolComponent,
        canActivate: [roleGuard],
        data: { permission: 'ticket-pool' }
      },
      {
        path: 'dashboard/manager',
        component: ManagerDashboardComponent,
        canActivate: [roleGuard],
        data: { permission: 'manager-dashboard' }
      },
      {
        path: 'dashboard/manager/analytics',
        component: AnalyticsComponent,
        canActivate: [roleGuard],
        data: { permission: 'analytics' }
      },

      // Unknown URLs go to the landing page rather than a dead outlet.
      { path: '**', redirectTo: '' }
    ])
  ],
  providers: [
    { provide: APP_ID, useValue: 'ng-cli-universal' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizeInterceptor, multi: true },
    { provide: API_BASE_URL, useFactory: getApiBaseUrl, deps: [] },
    provideAppInitializer(() => inject(AuthService).initialize()),
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule {}
