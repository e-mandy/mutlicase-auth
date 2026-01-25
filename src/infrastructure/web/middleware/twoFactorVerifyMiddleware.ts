import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../domain/exceptions/AppError.ts";
import { PrismaUserRepository } from "../../repositories/PrismaUserRepository.ts";

const prismaRepository = new PrismaUserRepository();

export const twoFactorVerifyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    if(!userId) throw new AppError("USER UNAUTHORIZED", 401);

    const twoFactorIsActive = prismaRepository.checkTwoFactorActive(userId);
    if(!twoFactorIsActive){
        next();
    }else{
        req.user = { ...req.user, twoFactorEnabled: true } as { userId: string, twoFactorEnabled: boolean };
        next();
    }
}