import { prisma } from "../lib/prisma.js";

export async function getTotalDataVariants(search = "") {
  try {
    const totalData = await prisma.variant.count({
      where: search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {},
    });

    return totalData;
  } catch (err) {
    console.error("Error while counting variants: ", err);
    throw err;
  }
}

export async function getListAllVariants(page, limit, search = "") {
  try {
    const offset = (page - 1) * limit;

    const variants = await prisma.variant.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {},
      select: {
        id: true,
        name: true,
        variantCost: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: "asc",
      },
      skip: offset,
      take: limit,
    });

    return variants;
  } catch (err) {
    console.error("Error while getting variants: ", err);
    throw err;
  }
}
