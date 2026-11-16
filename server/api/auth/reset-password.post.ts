import bcrypt from "bcrypt";
import { resetPasswordSchema } from "~~/shared/schemas/auth";

export default defineEventHandler(async (event) => {
  checkRateLimit(event, { limit: 3, windowMs: 60 * 1000 }); // Max 3 requests per minute

  const body = await readBody(event);
  const validation = resetPasswordSchema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.issues[0]?.message || "Invalid data",
    });
  }

  const { token, password } = validation.data;

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password reset link is invalid or has expired",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetTokenExpiresAt: null,
    },
  });

  return { success: true };
});
