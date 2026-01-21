import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import type { IMailerService } from "../../domain/services/IMailerService.ts";
import jwt from 'jsonwebtoken';

export class RequestPasswordReset {
    private userRepository: IUserRepositories;
    private mailService: IMailerService;
    private secretResetPassword: string | null;

    constructor(repository: IUserRepositories, mailServices: IMailerService){
        this.userRepository = repository;
        this.mailService = mailServices;
        this.secretResetPassword = process.env.SECRET_PASSWORD_RESET_APP || null;
    }

    async execute(email: string){
        if(!this.secretResetPassword){
            console.log("Reset password secret key not available");
            throw new AppError('INTERNAL SERVER ERROR', 500);
        }

        const result = await this.userRepository.findByEmail(email);
        if(!result) throw new AppError("INVALID CREDENTIALS", 400);

        const newRequestResetToken = jwt.sign({ userId: result.id }, this.secretResetPassword, { expiresIn: "30m"})

        this.mailService.sendPasswordResetToken(email, newRequestResetToken);
    }
}