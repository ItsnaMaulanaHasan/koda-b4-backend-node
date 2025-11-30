import { prisma } from "../lib/prisma.js";

export async function getTotalDataCategories(search = "") {
  try {
    const totalData = await prisma.category.count({
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

export async function getListAllCategories(page, limit, search = "") {
  try {
    const offset = (page - 1) * limit;

    const sizes = await prisma.category.findMany({
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
