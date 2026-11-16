import jwt from "jsonwebtoken";
interface JwtPayload {
  sub?: string;
  email?: string;
  isVerified?: boolean;
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  if (!url.pathname.startsWith("/api")) {
    return;
  }

  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/demo",
    "/api/auth/verify",
    "/api/auth/resend-verification",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/coins/markets",
    "/api/cron/snapshot",
  ];
  if (publicRoutes.some((route) => url.pathname.startsWith(route))) {
    return;
  }

  const token = getCookie(event, "auth_token");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Please log in to your account first.",
    });
  }

  try {
    const { jwtSecret } = useRuntimeConfig();
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    const userId = Number(decoded.sub);

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "The user ID in the token is invalid.",
      });
    }

    if (!decoded.isVerified) {
      throw createError({
        statusCode: 403,
        statusMessage: "Email not verified",
      });
    }

    event.context.auth = {
      userId,
      email: decoded.email,
    };
  } catch (error: any) {
    if (error?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 401,
      statusMessage: "Your user session has expired or is invalid.",
    });
  }
});
