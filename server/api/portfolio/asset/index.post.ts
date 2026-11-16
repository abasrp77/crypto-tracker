import { addAssetSchema } from "~~/shared/schemas/portfolio";

export default defineEventHandler(async (event) => {
  const userId = event.context.auth?.userId as number;
  const body = await readValidatedBody(event, (b) => addAssetSchema.parse(b));

  let portfolio = await prisma.portfolio.findFirst({
    where: { userId },
  });

  if (!portfolio) {
    portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: "Main Portfolio",
      },
    });
  }

  const newAsset = await prisma.cryptoAsset.create({
    data: {
      portfolioId: portfolio.id,
      coingeckoId: body.coingeckoId,
      symbol: body.symbol,
      name: body.name,
      image: body.image,
      amount: body.amount,
      buyPriceUsd: body.buyPriceUsd,
    },
  });

  return {
    success: true,
    asset: newAsset,
  };
});
