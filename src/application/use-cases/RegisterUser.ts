import type { createUserDto } from "../../domain/dtos/createUserDto.js";
import type { UserEntity } from "../../domain/entities/user.js";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.js";
import bcrypt from 'bcrypt';
import type { ITokenService } from "../../domain/security/ITokenService.js";

export class RegisterUser{
    private userRepository: IUserRepositories;
    private tokenService: ITokenService;

    constructor(repository: IUserRepositories, tokenService: ITokenService){
        this.userRepository = repository;
        this.tokenService = tokenService;
    }
    
    async execute(data: createUserDto): Promise<{ user: UserEntity, access_token: string, refresh_token: string }>{
        const existUser = await this.userRepository.findByEmail(data.email);

        console.log("je passe ?")
        if(!existUser){
            throw new Error("USER_ALREADY_EXISTS");
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

        const access_token = this.tokenService.generateAccessToken({ userId: newUser.id });
        const refresh_token = this.tokenService.generateRefreshToken({ userId: newUser.id });

        await this.userRepository.saveRefreshToken(newUser.id, refresh_token, new Date(Date.now() + (1000 * 7 * 24 * 60 * 60)));

        return {
            user: newUser,
            access_token,
            refresh_token
        }
    }
}