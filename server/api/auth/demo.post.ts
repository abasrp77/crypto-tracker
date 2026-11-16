import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const demoEmail = "demo@cryptotracker.app";

  let user = await prisma.user.findUnique({
    where: { email: demoEmail },
    include: {
      portfolios: {
        include: {
          assets: true,
        },
      },
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Demo Investor",
        isVerified: true,
        portfolios: {
          create: {
            name: "Main Portfolio",
            assets: {
              create: [
                {
                  coingeckoId: "bitcoin",
                  symbol: "BTC",
                  name: "Bitcoin",
                  image:
                    "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
                  amount: 0.65,
                  buyPriceUsd: 58400,
                },
                {
                  coingeckoId: "ethereum",
                  symbol: "ETH",
                  name: "Ethereum",
                  image:
                    "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
                  amount: 3.5,
                  buyPriceUsd: 2200,
                },
                {
                  coingeckoId: "solana",
                  symbol: "SOL",
                  name: "Solana",
                  image:
                    "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
                  amount: 25,
                  buyPriceUsd: 140,
                },
                {
                  coingeckoId: "dogecoin",
                  symbol: "DOGE",
                  name: "Dogecoin",
                  image:
                    "https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png",
                  amount: 10000,
                  buyPriceUsd: 0.15,
                },
                {
                  coingeckoId: "tether",
                  symbol: "USDT",
                  name: "Tether",
                  image:
                    "https://coin-images.coingecko.com/coins/images/325/large/Tether.png",
                  amount: 5000,
                  buyPriceUsd: 1.0,
                },
              ],
            },
          },
        },
      },
      include: {
        portfolios: {
          include: {
            assets: true,
          },
        },
      },
    });
  } else if (!user.portfolios || user.portfolios.length === 0) {
    await prisma.portfolio.create({
      data: {
        name: "Main Portfolio",
        userId: user.id,
      },
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
    message: "Logged in as Demo Investor",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      portfolios: user.portfolios,
    },
  };
});
