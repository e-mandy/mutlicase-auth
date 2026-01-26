import type { createUserDto } from "../../domain/dtos/createUserDto.js";
import type { UserEntity } from "../../domain/entities/user.js";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.js";
import bcrypt from 'bcrypt';
import type { ITokenService } from "../../domain/security/ITokenService.js";
import type { IMailerService } from "../../domain/services/IMailerService.ts";

export class RegisterUser{
    private userRepository: IUserRepositories;
    private mailService: IMailerService;
    tokenService: ITokenService;

    constructor(repository: IUserRepositories, mailService: IMailerService, tokenService: ITokenService){
        this.userRepository = repository;
        this.mailService = mailService;
        this.tokenService = tokenService;
    }
    
    async execute(data: createUserDto){
        const existUser = await this.userRepository.findByEmail(data.email);

        if(existUser){
            console.log("User already exists");
            throw new Error("INVALID CREDENTIALS");
        }
        let hashedPassword: string | null = null;
        if(data.password){
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(data.password, salt);
        }else{
            throw new Error('BAD CREDENTIALS');
        }

        const newUser = await this.userRepository.create({
            email: data.email,
            password: hashedPassword
        });

        const token = this.tokenService.generateEmailToken({ email: data.email });
        this.mailService.sendVerificationEmail(newUser.email, token);

        return {
            message: "User created successfully",
        };
    }
}