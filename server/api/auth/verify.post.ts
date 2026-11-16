import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { code, token, email } = body;

  if (!code && !token) {
    throw createError({
      statusCode: 400,
      statusMessage: "Verification code or token is required",
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      ...(token
        ? { verificationToken: token }
        : { email, verificationCode: code }),
      tokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or expired verification credentials",
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationCode: null,
      verificationToken: null,
      tokenExpiresAt: null,
    },
  });

  const { jwtSecret } = useRuntimeConfig();
  const authToken = jwt.sign(
    {
      email: user.email,
      isVerified: true,
    },
    jwtSecret,
    {
      subject: String(user.id),
      expiresIn: "7d",
    },
  );

  setCookie(event, "auth_token", authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return {
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
  };
});
