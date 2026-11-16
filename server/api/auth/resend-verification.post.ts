import { emailSchema } from "~~/shared/schemas/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validation = emailSchema.safeParse(body?.email);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Valid email is required",
    });
  }

  const email = validation.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  if (user.isVerified) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email is already verified",
    });
  }

  await generateAndSendVerification({
    userId: user.id,
    email: user.email,
    name: user.name,
    event,
  });

  return { success: true };
});
