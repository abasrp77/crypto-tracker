import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const basePrisma = new PrismaClient();

  return basePrisma.$extends({
    query: {
      cryptoAsset: {
        // 1. Intercept delete and update deletedAt for soft delete
        async delete({ args }) {
          return basePrisma.cryptoAsset.update({
            ...args,
            data: { deletedAt: new Date() },
          });
        },

        // 2. Filter out soft-deleted records in findMany
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            deletedAt: null,
          };
          return query(args);
        },

        // 3. Filter out soft-deleted records in findFirst
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            deletedAt: null,
          };
          return query(args);
        },

        // 4. Exclude soft-deleted records in count
        async count({ args, query }) {
          args.where = {
            ...args.where,
            deletedAt: null,
          };
          return query(args);
        },

        // 5. Exclude soft-deleted records in aggregate
        async aggregate({ args, query }) {
          args.where = {
            ...args.where,
            deletedAt: null,
          };
          return query(args);
        },
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
