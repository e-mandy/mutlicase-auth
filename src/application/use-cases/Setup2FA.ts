import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import type { IOTPService } from "../../domain/security/IOTPService.ts";

export class Setup2FA{
    private userRepository: IUserRepositories;
    private otpService: IOTPService;

    constructor(repository: IUserRepositories, otpServices: IOTPService){
        this.userRepository = repository;
        this.otpService = otpServices;
    }

    async execute(email: string){
        const user = await this.userRepository.findByEmail(email);
        if(!user) throw new AppError('INVALID CREDENTIALS', 400);

        const is2FAActive = await this.userRepository.verify2FAActivate(email);
        if(is2FAActive) return ;

        const secretDatas = this.otpService.generateSecret(email);
        await this.userRepository.save2FASecret(secretDatas.secret, user.id);

        return secretDatas.qrcode;
    }
}