import type { OAuthAccount, PasswordResetToken, User, VerificationToken } from "@prisma/client";
import type { createUserDto } from "../dtos/createUserDto.js";
import type { UserEntity } from "../entities/user.js";


export interface IUserRepositories {
    findById: (userId: string) => Promise<Omit<UserEntity, 'password'> | null>
    findByEmail: (email: string) => Promise<UserEntity | null>,
    create: (user: createUserDto) => Promise<UserEntity>,
    saveRefreshToken: (userId: string, token: string, expiresAt: Date) => Promise<void>
    revokeRefreshToken: (token: string) => Promise<void>
    blacklistAccessToken: (token: string) => Promise<void>
    saveVerificationToken: (token: string, userId: string) => Promise<void>
    findVerificationToken: (token: string) => Promise<VerificationToken| null>
    activateUser: (id: string) => Promise<void>
    deleteVerificationToken: (token: string) => Promise<void>
    findTokenResetPassword: (token: string) => Promise<PasswordResetToken | null>
    updatePassword: (id: string, hashedPassword: string) => Promise<void>
    removePasswordResetToken: (userId: string) => Promise<void>
    findUserByOAuth: (provider: string, providerId: string) => Promise<OAuthAccount | null>
    linkOAuthAccount: (userId: string, data: any) => Promise<void>
    verify2FAActivate: (email: string) => Promise<boolean | null>
    save2FASecret: (secret: string, userId: string) => Promise<void>
    findSecretByUserId: (userId: string) => Promise<string | null>
    activateUser2FA: (userId: string) => Promise<void>
    saveLoginAttempt: (datas: {
        userId?: string,
        email: string,
        ip: string,
        userAgent: string,
        status: "SUCCESS" | "FAILED"
    }) => Promise<void>
    cleanupExpiredTokens: () => Promise<void>
}