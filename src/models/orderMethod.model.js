import { prisma } from "../lib/prisma.js";

export async function getAllOrderMethods() {
  try {
    const orderMethods = await prisma.orderMethod.findMany({
      select: {
        id: true,
        name: true,
        deliveryFee: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return orderMethods;
  } catch (err) {
    console.error("Error while getting order methods: ", err);
    throw err;
  }
}
