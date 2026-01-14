import type { createUserDto } from "../../domain/dtos/createUserDto.js";
import type { UserEntity } from "../../domain/entities/user.js";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.js";

export class RegisterUser{
    private userRepository: IUserRepositories;

    constructor(repository: IUserRepositories){
        this.userRepository = repository;
    }
    
    async execute(data: createUserDto): Promise<UserEntity>{
        if(await this.userRepository.findByEmail(data.email) !== null){
            throw new Error("USER_ALREADY_EXISTS");
        }

        return await this.userRepository.create(data);
    }
}