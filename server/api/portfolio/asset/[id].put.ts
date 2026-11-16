export default defineEventHandler(async (event) => {
  const userId = event.context.auth?.userId;

  const id = Number(getRouterParam(event, "id"));
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid asset ID" });
  }

  const body = await readBody(event);
  const amount = Number(body.amount);
  const buyPriceUsd = Number(body.buyPriceUsd);

  if (isNaN(amount) || amount <= 0 || isNaN(buyPriceUsd) || buyPriceUsd < 0) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid amount or buy price values",
    });
  }

  const existingAsset = await prisma.cryptoAsset.findFirst({
    where: {
      id,
      portfolio: {
        userId,
      },
    },
  });

  if (!existingAsset) {
    throw createError({ statusCode: 404, statusMessage: "Asset not found" });
  }

  const updatedAsset = await prisma.cryptoAsset.update({
    where: { id },
    data: {
      amount,
      buyPriceUsd,
    },
  });

  return {
    success: true,
    data: updatedAsset,
  };
});
