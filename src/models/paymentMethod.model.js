import { prisma } from "../lib/prisma.js";

export async function getAllPaymentMethods() {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      select: {
        id: true,
        image: true,
        name: true,
        adminFee: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return paymentMethods;
  } catch (err) {
    console.error("Error while getting payment methods: ", err);
    throw err;
  }
}
