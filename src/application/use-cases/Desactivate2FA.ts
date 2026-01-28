import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";

export class Desactivate2FA{
    private userRepository: IUserRepositories;

    constructor(repository: IUserRepositories){
        this.userRepository = repository;
    }

    execute(token: string, userId: string){
        
    }
}