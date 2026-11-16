export default defineEventHandler(async (event) => {
  const userId = event.context.auth?.userId as number;

  if (!userId) {
    return { user: null };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    return { user };
  } catch {
    return { user: null };
  }
});
