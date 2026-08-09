import { createClient } from 'redis';

const redis = createClient({ 
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});
redis.on('error', (err) => console.error('❌ Redis error:', err));
await redis.connect();
console.log('✅ Connected to Redis');

export default redis;