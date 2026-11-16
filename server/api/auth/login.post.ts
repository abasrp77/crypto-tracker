import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginSchema } from "~~/shared/schemas/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validation = loginSchema.safeParse(body);
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        validation.error.issues[0]?.message ||
        "The entered information is invalid.",
    });
  }
  const { email, password } = validation.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      portfolios: true,
    },
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "The email or password is incorrect.",
    });
  }

  if (!user.password) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "This account was registered using Google. Please log in with Google.",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "The email or password is incorrect.",
    });
  }

  if (!user.isVerified) {
    await generateAndSendVerification({
      userId: user.id,
      email: user.email,
      name: user.name,
      event,
    });
    throw createError({
      statusCode: 403,
      statusMessage: "Please verify your email address first",
    });
  }

  const { jwtSecret } = useRuntimeConfig();
  const token = jwt.sign(
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

  setCookie(event, "auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return {
    success: true,
    message: "The entry was successful.",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      portfolios: user.portfolios,
    },
  };
});
