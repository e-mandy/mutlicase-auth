import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts"
import type { ITokenService } from "../../domain/security/ITokenService.ts";

export class VerifyTokenResetPassword {
    private userRepository: IUserRepositories;
    private tokenService: ITokenService;

    constructor(repository: IUserRepositories, tokenServices: ITokenService){
        this.userRepository = repository;
        this.tokenService = tokenServices;
    }

    async execute(token: string){
        const resetToken = await this.userRepository.findTokenResetPassword(token);
        if(!resetToken) new AppError('INVALID TOKEN', 400);

        const decoded = this.tokenService.verifyResetPasswordToken(token);
        if(!decoded) throw new AppError('TOKEN EXPIRED', 401);

        return this.tokenService.generateRequestResetToken({ userId: decoded.userId });
    }
}