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

    async revokeRefreshToken(token: string){
        await prisma.refreshToken.update({
            where: {
                token: token,
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

    async saveVerificationToken(token: string, userId: string){
        const tokenExpiration = jwt.decode(token) as { exp: number };
        await prisma.verificationToken.create({
            data: {
                token: token,
                createdAt: new Date(),
                userId: userId,
                expiresAt: new Date(tokenExpiration.exp * 1000)
            }
        });
    }

    async findVerificationToken(token: string){
        const result = await prisma.verificationToken.findUnique({
            where: {
                token: token,
            },
        });

        return result;
    }

    async activateUser(id: string){
        await prisma.user.update({
            where: {
                id: id
            },
            data: {
                emailVerifiedAt: new Date()
            }
        });
    }

    async deleteVerificationToken(token: string){
        await prisma.verificationToken.delete({
            where: {
                token: token
            }
        });
    }

    async findTokenResetPassword(token: string){
        return await prisma.passwordResetToken.findUnique({
            where: {
                token: token
            }
        });
    }

    async updatePassword(email: string, hashedPassword: string){
        await prisma.user.update({
            where: {
                id: email
            },
            data: {
                password: hashedPassword
            }
        });
    };

    async removePasswordResetToken(id: string){
        await prisma.passwordResetToken.deleteMany({
            where: {
                userId: id
            }
        });
    }

    async linkOAuthAccount(userId: string, data: any){
        //
    }

    async findUserByOAuth(provider: string, providerId: string){
        return await prisma.oAuthAccount.findUnique({
            where: {
                provider_providerId: {
                    provider: provider,
                    providerId: providerId
                }
            }
        });
    }

    async verify2FAActivate(email: string){
        let isActive = null;
        isActive =  prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                twoFactorEnabledAt: true
            }
        });
        return (isActive === null) ? null : true;
    }

    async save2FASecret(secret: string, userId: string){
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                twoFactorSecret: secret
            }
        });
    }

    async activateUser2FA(userId: string){
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                twoFactorEnabledAt: new Date()
            }
        });
    }

    async findSecretByUserId(userId: string){
        const result = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                twoFactorSecret: true
            }
        });

        return (!result) ? null : result.twoFactorSecret;
    }

    async saveLoginAttempt(datas: { userId?: string; email: string; ip: string; userAgent: string; status: "SUCCESS" | "FAILED"; }){
        await prisma.loginHistory.create({
            data: {
                ip: datas.ip,
                userAgent: datas.userAgent,
                success: !(datas.status === 'FAILED'),
                userId: datas?.userId ?? null
            }
        });
    }

    async cleanupExpiredTokens(){
        const now = new Date();

        // Suppresion des access token blacklistée qui ont expiré.
        await prisma.blacklistedAccessToken.deleteMany({
            where: {
                expiresAt: { lt: now }
            }
        });

        // Suppression des refresh token expirés ou révoqués.
        await prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    {
                        expiresAt: { lt: now },
                        revokedAt: { not: null }
                    }
                ]
            }
        });
    }
}