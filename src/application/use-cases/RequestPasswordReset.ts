import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import type { ITokenService } from "../../domain/security/ITokenService.ts";
import type { IMailerService } from "../../domain/services/IMailerService.ts";

export class RequestPasswordReset {
    private userRepository: IUserRepositories;
    private mailService: IMailerService;
    private tokenService: ITokenService;

    constructor(repository: IUserRepositories, mailServices: IMailerService, tokenServices: ITokenService){
        this.userRepository = repository;
        this.mailService = mailServices;
        this.tokenService = tokenServices;
    }

    async execute(email: string){

        const result = await this.userRepository.findByEmail(email);
        if(!result) throw new AppError("INVALID CREDENTIALS", 400);

        const newRequestResetToken = this.tokenService.generateRequestResetToken({ userId: result.id });

        this.mailService.sendPasswordResetToken(email, newRequestResetToken);
    }
}