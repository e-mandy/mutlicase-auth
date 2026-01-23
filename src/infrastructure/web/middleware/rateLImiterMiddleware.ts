import type { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AppError } from '../../../domain/exceptions/AppError.ts';

export const rateLimiterMiddleware = rateLimit({
    windowMs: 1000 * 60 * 15,
    limit: 5,
    ipv6Subnet: 56,
    message: { message: "Stop force bro !!" },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        // 429 (too many requests)
        throw new AppError('Trop de requêtes depuis votre adresse. Vous serez bloqués pendant 15min', 429);
    }
});