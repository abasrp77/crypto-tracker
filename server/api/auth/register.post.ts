import bcrypt from "bcrypt";
import { registerSchema } from "~~/shared/schemas/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validation = registerSchema.safeParse(body);
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        validation.error.issues[0]?.message ||
        "The entered information is invalid.",
    });
  }
  const { email, password, name } = validation.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: "This email has already been registered.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      isVerified: false,
    },
  });

  await generateAndSendVerification({
    userId: user.id,
    email: user.email,
    name: user.name,
    event,
  });

  return {
    success: true,
    email: user.email,
  };
});
