import { prisma } from "../lib/prisma.js";

export async function getUserByEmail(email) {
  try {
    const result = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    return result;
  } catch (err) {
    console.log("Error while get data user by email: ", err);
    throw err;
  }
}
