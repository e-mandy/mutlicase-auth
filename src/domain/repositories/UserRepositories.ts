import type { createUserDto } from "../dtos/createUserDto.js";
import type { UserEntity } from "../entities/user.js";


export interface IUserRepositories {
    findByEmail: (email: string) => Promise<UserEntity | null>,
    create: (user: createUserDto) => Promise<UserEntity>,
    saveRefreshToken: (userId: string, token: string, expiresAt: Date) => Promise<void>
    revokeRefreshToken: (token: string) => Promise<void>
    blacklistAccessToken: (token: string) => Promise<void>
    findVerificationToken: (token: string) => Promise<string | null>
    activateUser: (id: string) => Promise<void>
    deleteVerificationToken: (token: string) => Promise<void>
}