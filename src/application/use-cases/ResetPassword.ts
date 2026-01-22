import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import bcrypt from 'bcrypt';

export class ResetPassword{
    userRepository: IUserRepositories;

    constructor(repository: IUserRepositories){
        this.userRepository= repository;
    }

    async execute(email: string, password: string){
        const user = await this.userRepository.findByEmail(email);
        if(!user) throw new AppError('INVALID CREDENTIALS', 400);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await this.userRepository.updatePassword(user.email, hashedPassword);

        await this.userRepository.removePasswordResetToken(user.id);
    }
}