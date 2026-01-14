import type { UserEntity } from "../../domain/entities/user.js";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.js";
import bcrypt from 'bcrypt';

export class LoginUser {
    repositories: IUserRepositories;

    constructor(repository: IUserRepositories){
        this.repositories = repository;
    }

    async execute(email: string, password: string): Promise<UserEntity>{
        const user = await this.repositories.findByEmail(email);
        if(!user) throw new Error("INVALID CREDENTIALS");

        if(!user.password) throw new Error("INVALID CREDENTIALS");

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if(!isPasswordMatched) throw new Error("INVALID CREDENTIALS")

        return user;
    }
}