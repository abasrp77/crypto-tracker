import crypto from "crypto";
import type { H3Event } from "h3";

interface SendVerificationOptions {
  userId: number;
  email: string;
  name?: string | null;
  event?: H3Event;
}

export const generateAndSendVerification = async ({
  userId,
  email,
  name,
  event,
}: SendVerificationOptions) => {
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationCode,
      verificationToken,
      tokenExpiresAt,
    },
  });

  await sendVerificationEmail({
    to: email,
    name: name || "User",
    code: verificationCode,
    token: verificationToken,
    event,
  });

  return {
    verificationCode,
    verificationToken,
    tokenExpiresAt,
  };
};
