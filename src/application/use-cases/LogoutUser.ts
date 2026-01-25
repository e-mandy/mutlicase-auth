import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.js";

export class LogoutUser {
    private repository: IUserRepositories;

    constructor(repository: IUserRepositories){
        this.repository = repository;
    }
    
    async execute(refresh_token: string, access_token: string){
        try{
            await this.repository.revokeRefreshToken(refresh_token);
    
            await this.repository.blacklistAccessToken(access_token);

            return true;
        }catch(error: any){
            throw new AppError(error.name, 500);
        }
    }
}