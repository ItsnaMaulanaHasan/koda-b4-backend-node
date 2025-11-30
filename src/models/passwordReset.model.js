import { prisma } from "../lib/prisma.js";

export async function getUserIdByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true },
    });

    if (!user) {
      throw new Error("Email not found");
    }

    return user.id;
  } catch (err) {
    console.error("Error while getting user by email:", err);
    throw err;
  }
}

export async function deleteOldPasswordResetTokens(userId) {
  try {
    await prisma.passwordReset.deleteMany({
      where: { userId: userId },
    });
  } catch (err) {
    console.error("Error while deleting old tokens:", err);
    throw err;
  }
}

export async function insertPasswordResetToken(userId, token) {
  try {
    const passwordReset = await prisma.passwordReset.create({
      data: {
        userId: userId,
        tokenReset: token,
        expiredAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return passwordReset;
  } catch (err) {
    console.error("Error while creating reset token:", err);
    throw err;
  }
}

export async function verifyPasswordResetToken(email, token) {
  try {
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        tokenReset: token,
        user: {
          email: email,
        },
      },
      select: {
        userId: true,
        expiredAt: true,
      },
    });

    if (!passwordReset) {
      throw new Error("Invalid token");
    }

    return {
      userId: passwordReset.userId,
      expiredAt: passwordReset.expiredAt,
    };
  } catch (err) {
    console.error("Error while verifying token:", err);
    throw err;
  }
}

export async function updateUserPassword(userId, hashedPassword) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedBy: userId,
      },
    });
  } catch (err) {
    console.error("Error while updating password:", err);
    throw err;
  }
}
