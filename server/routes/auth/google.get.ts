import jwt from "jsonwebtoken";

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    if (!user.email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Google account has no email associated",
      });
    }

    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          name: user.name || user.email.split("@")[0],
          isVerified: true,
        },
      });
    }

    await setUserSession(event, {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
      },
    });

    const { jwtSecret } = useRuntimeConfig();
    const token = jwt.sign(
      {
        email: dbUser.email,
        isVerified: true,
      },
      jwtSecret,
      {
        subject: String(dbUser.id),
        expiresIn: "7d",
      },
    );

    setCookie(event, "auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return sendRedirect(event, "/dashboard");
  },
  onError(event, error) {
    console.error("OAuth Google Error:", error);
    return sendRedirect(event, "/auth/login?error=oauth_failed");
  },
});
