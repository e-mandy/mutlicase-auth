import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import type { IOTPService } from "../../domain/security/IOTPService.ts";

export class Desactivate2FA{
    private userRepository: IUserRepositories;
    private otpService: IOTPService;

    constructor(repository: IUserRepositories, otpServices: IOTPService){
        this.userRepository = repository;
        this.otpService = otpServices;
    }

    async execute(token: string, email: string){
        try{
            const user = await this.userRepository.findByEmail(email);
            if(!user) throw new AppError('INVALID CREDENTIALS', 400);
    
            if(!user.twoFactorSecret) throw new AppError('TWO FACTOR NOT ACTIVATED', 401);
            const user2FASecret = user.twoFactorSecret;

            const isValidToken = this.otpService.verifyOTPCode(token, user2FASecret);
            if(!isValidToken) throw new AppError('TOKEN NOT VALID', 401);

            await this.userRepository.desactivateUser2FA(user.id);
        }catch(error: any){
            throw new AppError(error.name, 500);
        }
    }
}