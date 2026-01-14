import type { createUserDto } from "../../domain/dtos/createUserDto.js";
import type { UserEntity } from "../../domain/entities/user.js";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.js";
import bcrypt from 'bcrypt';

export class RegisterUser{
    private userRepository: IUserRepositories;

    constructor(repository: IUserRepositories){
        this.userRepository = repository;
    }
    
    async execute(data: createUserDto): Promise<UserEntity>{
        if(await this.userRepository.findByEmail(data.email) !== null){
            throw new Error("USER_ALREADY_EXISTS");
        }

        let hashedPassword: string | null = null;
        if(data.password){
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(data.password, salt);
        }

        return await this.userRepository.create({
            email: data.email,
            password: hashedPassword
        });
    }
}