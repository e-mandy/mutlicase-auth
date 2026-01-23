import { rateLimit } from 'express-rate-limit';

export const rateLimiterMiddleware = rateLimit({
    windowMs: 1000 * 60 * 15,
    limit: 5,
    ipv6Subnet: 56,
    message: { message: "Stop force bro !!" },
    standardHeaders: true,
    legacyHeaders: false
});