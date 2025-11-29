import { getRedisClient } from "../lib/redis.js";

export async function cache(req, res, next) {
  try {
    const redis = getRedisClient();
    const cacheKey = req.originalUrl;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      redis.setEx(cacheKey, 3600, JSON.stringify(data));
      return originalJson(data);
    };

    next();
  } catch (err) {
    console.error(err);
    next();
  }
}

export async function invalidateCache(pattern) {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error(error);
  }
}
