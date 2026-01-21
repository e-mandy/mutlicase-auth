import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import type { IMailerService } from "../../domain/services/IMailerService.ts";

export class RequestPasswordReset {
    private userRepository: IUserRepositories;
    mailService: IMailerService;

    constructor(repository: IUserRepositories, mailServices: IMailerService){
        this.userRepository = repository;
        this.mailService = mailServices;
    }

    execute(email: string){
        const result = this.userRepository.findByEmail(email);
        if(!result) throw new AppError("INVALID CREDENTIALS", 400);


    }
}