import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import speakeasy from 'speakeasy';

class Confirm2FA{
    private userRepository: IUserRepositories;

    constructor(repository: IUserRepositories){
        this.userRepository = repository;
    }
    
    async execute(userId: string, otpCode: string){
        const userSecret = await this.userRepository.findSecretByUserId(userId);
        if(!userSecret) throw new AppError('USER SECRET OTP NOT FOUND', 500);

        const result = speakeasy.totp.verify({ secret: String(userSecret), encoding: 'base32', otpCode })
        if(!result) throw new AppError('2FA CODE INVALID', 400);

        await this.userRepository.activateUser2FA(userId);
    }
}