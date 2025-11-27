import { hashPassword } from "../lib/hashPasswordArgon2.js";
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

export async function addUser(data) {
  try {
    const hashed = await hashPassword(data.password);
    const result = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashed,
      },
    });
    return result;
  } catch (err) {
    console.log("Error while register: ", err);
    throw err;
  }
}

export async function checkUserEmail(email) {
  try {
    const result = await prisma.user.findFirst({
      where: { email: email },
    });

    if (result) {
      return true;
    }

    return false;
  } catch (err) {
    console.error("Error get user by email:", err);
    throw err;
  }
}
