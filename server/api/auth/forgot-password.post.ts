import crypto from "crypto";
import { emailSchema } from "~~/shared/schemas/auth";

export default defineEventHandler(async (event) => {
  checkRateLimit(event, { limit: 3, windowMs: 60 * 1000 }); // Max 3 requests per minute
  const body = await readBody(event);
  const validation = emailSchema.safeParse(body?.email);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Valid email is required",
    });
  }

  const email = validation.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // For security reasons, we return a success response even if the email is not found, to prevent email addresses from being exposed (Security by Obscurity).
  if (!user) {
    return { success: true };
  }

  const resetPasswordToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken,
      resetTokenExpiresAt,
    },
  });

  await sendResetPasswordEmail({
    to: user.email,
    name: user.name || "Investor",
    token: resetPasswordToken,
    event,
  });

  return { success: true };
});
