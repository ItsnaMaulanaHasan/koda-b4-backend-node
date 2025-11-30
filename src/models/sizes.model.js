import { prisma } from "../lib/prisma.js";

export async function getTotalDataSizes(search = "") {
  try {
    const totalData = await prisma.size.count({
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
    console.error("Error while counting sizes: ", err);
    throw err;
  }
}

export async function getListAllSizes(page, limit, search = "") {
  try {
    const offset = (page - 1) * limit;

    const sizes = await prisma.size.findMany({
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
        sizeCost: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: "asc",
      },
      skip: offset,
      take: limit,
    });

    return sizes;
  } catch (err) {
    console.error("Error while getting sizes: ", err);
    throw err;
  }
}
