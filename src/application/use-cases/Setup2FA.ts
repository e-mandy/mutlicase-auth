import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import speakeasy from 'speakeasy';

export class Setup2FA{
    private userRepository: IUserRepositories;

    constructor(repository: IUserRepositories){
        this.userRepository = repository;
    }

    async execute(email: string){
        const is2FAActive = await this.userRepository.verify2FAActivate(email);
        if(is2FAActive) return ;

        const newSecret = speakeasy.generateSecret({
            length: 20,
            name: `MonApp:${email}`,
            issuer: "MonApp" 
        });
        await this.userRepository.save2FASecret(newSecret.base32);

        return newSecret.otpauth_url;
    }
}