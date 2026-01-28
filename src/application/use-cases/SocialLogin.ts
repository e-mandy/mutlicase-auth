import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import type { ITokenService } from "../../domain/security/ITokenService.ts";

export class SocialLogin{
    private userRepository: IUserRepositories;
    private tokenService: ITokenService;

    constructor(repository: IUserRepositories, tokenServices: ITokenService){
        this.userRepository = repository;
        this.tokenService = tokenServices;
    }

    async execute(provider: string, providerId: string, email: string, emailVerified: boolean){
        if(!emailVerified) throw new AppError('PROVIDER EMAIL NOT VERIFIED', 403);

        let userId: string;
        const oAuthUser = await this.userRepository.findUserByOAuth(provider, providerId);
        if(oAuthUser){
            userId = oAuthUser.userId;
        }else{
            let user = await this.userRepository.findByEmail(email);
            if(!user){
                user = await this.userRepository.create({ email: email, password: null });
            }

            userId = user.id;
            await this.userRepository.linkOAuthAccount(userId, { provider, providerId });
            
            // On active la validation de l'email du user
            await this.userRepository.activateUser(userId);
        }

        const access_token = this.tokenService.generateAccessToken({ userId: userId });
        const refresh_token = this.tokenService.generateRefreshToken({ userId: userId });
    
        return {
            access_token,
            refresh_token
        };
    }
}