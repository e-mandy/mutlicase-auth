import type { UserEntity } from "../../domain/entities/user.js";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.js";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository.js";
import bcrypt from 'bcrypt';

export class LoginUser {
    repositories: IUserRepositories;

    constructor(repository: IUserRepositories){
        this.repositories = new PrismaUserRepository();
    }

    async execute(email: string, password: string): Promise<UserEntity>{
        const user = await this.repositories.findByEmail(email);
        if(user == null) throw new Error("INVALID CREDENTIALS");

        if(user.password !== undefined || user.password !== null){
            const hashed = user.password;
            const is_verified = await bcrypt.compare(password, hashed)
        }

        return user;
    }
}