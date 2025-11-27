import argon2 from "argon2";

export async function hashPassword(password) {
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
  return hash;
}

export async function verifyPassword(hash, plainPassword) {
  try {
    const valid = await argon2.verify(hash, plainPassword);
    return valid;
  } catch (err) {
    console.error("argon2 verify error:", err);
    return false;
  }
}
