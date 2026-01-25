import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";

export class CodeOTPVerify{
    private userRepository: IUserRepositories;

    constructor(repository: IUserRepositories){
        this.userRepository = repository
    }

    execute(token: string, userId: string){
        const user2FASecret = this.userRepository.findSecretByUserId(userId);

        if(!user2FASecret) throw new AppError('TWO FACTOR AUTHENTIFACTION NOT AVAILABLE', 400);
    }
}