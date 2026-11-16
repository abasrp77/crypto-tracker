export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId as number;
  const assetId = Number(getRouterParam(event, "id"));

  if (!assetId || isNaN(assetId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid asset ID",
    });
  }

  const asset = await prisma.cryptoAsset.findFirst({
    where: {
      id: assetId,
      portfolio: {
        userId,
      },
    },
    select: {
      id: true,
      portfolioId: true,
    },
  });

  if (!asset) {
    throw createError({
      statusCode: 404,
      statusMessage: "Asset not found or unauthorized",
    });
  }

  await prisma.cryptoAsset.delete({
    where: { id: asset.id },
  });

  return {
    success: true,
    message: "Asset removed successfully",
  };
});
