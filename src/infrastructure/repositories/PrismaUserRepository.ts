import type { createUserDto } from "../../domain/dtos/createUserDto.ts";
import type { UserEntity } from "../../domain/entities/user.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import { prisma } from "../database/prisma.ts";
import jwt from 'jsonwebtoken';

export class PrismaUserRepository implements IUserRepositories{

    async findByEmail(email: string): Promise<UserEntity | null>{
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        return user;
    }

    async create(user: createUserDto): Promise<UserEntity>{
        const newUser = await prisma.user.create({
            data: user
        });

        return newUser;
    };

    async saveRefreshToken(userId: string, token: string, expiresAt: Date){
        await prisma.refreshToken.create({
            data: {
                userId: userId,
                token: token,
                expiresAt: expiresAt
            }
        });
    };

    async revokeRefreshToken(token: string, userId: string){
        await prisma.refreshToken.update({
            where: {
                token: token,
                userId: userId
            },
            data: {
                revokedAt: new Date()
            }
        });
    }

    async blacklistAccessToken(token: string){
        // Pour récupérer la date d'expiration du token
        const tokenExpiration = jwt.decode(token) as { exp: number };
        await prisma.blacklistedAccessToken.create({
            data: {
                jti: token,
                expiresAt: new Date(tokenExpiration.exp * 1000)
            }
        });
    }
}