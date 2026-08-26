import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RedirectFunction, Router, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../../../api-authorization/auth.service';
import { RolePermissionService } from '../services/role-permission.service';

/** Route data key carrying the UI permission(s) a route needs. */
export const PERMISSION_DATA_KEY = 'permission';

/**
 * Collects the keys a route demands: its own, plus every guarded ancestor's. Reads
 * `routeConfig.data` rather than the resolved `data` so inherited values are not
 * counted twice.
 *
 * Within one route, several keys mean "any of these". Across nesting they accumulate,
 * so `/dashboard/manager/analytics` needs the manager shell *and* analytics.
 */
function requiredPermissions(route: ActivatedRouteSnapshot): string[][] {
  const groups: string[][] = [];
  for (const snapshot of route.pathFromRoot) {
    const value = snapshot.routeConfig?.data?.[PERMISSION_DATA_KEY];
    if (typeof value === 'string') {
      groups.push([value]);
    } else if (Array.isArray(value) && value.length) {
      groups.push(value);
    }
  }
  return groups;
}

/**
 * Blocks routes the signed-in user has no key for. Signed-out visitors go to the login
 * page with a return URL; signed-in users who simply lack the permission get the 403
 * page, because bouncing them to login would imply the wrong fix.
 *
 * A role holding `'*'` satisfies every check, including keys added after it was defined.
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const permissions = inject(RolePermissionService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const allowed = requiredPermissions(route).every(group => permissions.canAny(group));
  return allowed ? true : router.createUrlTree(['/forbidden'], { queryParams: { from: state.url } });
};

/**
 * Sends `/dashboard` to whichever dashboard the viewer's role owns, so links and
 * post-login redirects never need to know the role.
 *
 * A `redirectTo` function rather than a guard: the answer here is *always* a redirect,
 * and this form resolves while the URL is still being matched, so `/dashboard` never
 * needs a component of its own.
 */
export const dashboardHomeRedirect: RedirectFunction = () => {
  const auth = inject(AuthService);
  const permissions = inject(RolePermissionService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: '/dashboard' } });
  }

  return router.parseUrl(permissions.homeRoute());
};
