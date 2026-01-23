import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import type { IOTPService } from "../../domain/security/IOTPService.ts";
import bcrypt from 'bcrypt';

export class Setup2FA{
    private userRepository: IUserRepositories;
    private otpService: IOTPService;

    constructor(repository: IUserRepositories, totpService: IOTPService){
        this.userRepository = repository;
        this.otpService = totpService;
    }

    async execute(email: string){
        const is2FAActive = await this.userRepository.verify2FAActivate(email);
        if(is2FAActive) return ;

        const newSecret = this.otpService.generateSecret(email);
        
        const salt = await bcrypt.genSalt(10);
        const hashedSecret = await bcrypt.hash(newSecret, salt);
        await this.userRepository.save2FASecret(hashedSecret);
    }
}