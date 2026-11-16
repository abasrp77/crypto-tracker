export default defineNuxtRouteMiddleware((to, from) => {
  if (!from.path || from.path === to.path) return;

  const isLanding = (p: string) => p === "/";
  const isAuth = (p: string) => p.startsWith("/auth");
  const isDashboard = (p: string) => p.startsWith("/dashboard");

  let transition = null;

  // 1. Landing to Login (slide-in or fade)
  if (isLanding(from.path) && isAuth(to.path)) {
    transition = { name: "slide-over", mode: "in-out" as const };
  }
  // 2. Login to Landing (back to home)
  else if (isAuth(from.path) && isLanding(to.path)) {
    transition = { name: "slide-back", mode: "default" as const };
  }
  // 3. Login to Dashboard (primary app entry)
  else if (isAuth(from.path) && isDashboard(to.path)) {
    transition = { name: "slide-over", mode: "in-out" as const };
  }
  // 4. Dashboard to Login (user sign-out)
  else if (isDashboard(from.path) && isAuth(to.path)) {
    transition = { name: "slide-back", mode: "default" as const };
  }
  // 5. Landing to Dashboard (authenticated user / demo login)
  else if (isLanding(from.path) && isDashboard(to.path)) {
    transition = { name: "slide-over", mode: "in-out" as const };
  }
  // 6. Dashboard to Landing
  else if (isDashboard(from.path) && isLanding(to.path)) {
    transition = { name: "slide-back", mode: "default" as const };
  }

  if (transition) {
    to.meta.layoutTransition = transition;
    from.meta.layoutTransition = transition;
  }
});
