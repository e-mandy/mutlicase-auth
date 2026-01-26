import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import type { IOTPService } from "../../domain/security/IOTPService.ts";
import type { ITokenService } from "../../domain/security/ITokenService.ts";

export class CodeOTPVerify{
    private userRepository: IUserRepositories;
    private otpService: IOTPService;
        tokenService: ITokenService;

    constructor(repository: IUserRepositories, otpServices: IOTPService, tokenService: ITokenService){
        this.userRepository = repository;
        this.otpService = otpServices;
        this.tokenService = tokenService;
    }

    async execute(token: string, userId: string){
        const user2FASecret = await this.userRepository.findSecretByUserId(userId);
        if(!user2FASecret) throw new AppError('TWO FACTOR AUTHENTIFACTION NOT AVAILABLE', 400);

        const isValid = this.otpService.verifyOTPCode(token, user2FASecret);
        if(!isValid) throw new AppError('2FA CODE INVALID', 400);

        const access_token = this.tokenService.generateAccessToken({ userId: userId });
        const refresh_token = this.tokenService.generateRefreshToken({ userId: userId });

        await this.userRepository.saveRefreshToken(userId, refresh_token, new Date(Date.now() + (1000 * 7 * 24 * 60 * 60)));

        const user = await this.userRepository.findById(userId);
        
        return {
            access_token,
            refresh_token,
            user
        };
    }
}