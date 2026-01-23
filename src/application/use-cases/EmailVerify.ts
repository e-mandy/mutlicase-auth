import { AppError } from "../../domain/exceptions/AppError.ts";
import type { IUserRepositories } from "../../domain/repositories/UserRepositories.ts";
import jwt from 'jsonwebtoken';

export class EmailVerify{
    private userRepository: IUserRepositories;
    private secretMailApp: string | null;

    constructor(repository: IUserRepositories){
        this.userRepository = repository;
        this.secretMailApp = process.env.SECRET_MAIL_APP || null;
    }

    async execute(token: string){
        if(!this.secretMailApp){
            console.log("Clé secrète de mail indisponible");
            throw new AppError('INTERNAL SERVER ERROR', 500);
        }

        const result = await this.userRepository.findVerificationToken(token);

        if(!result) throw new AppError('TOKEN NOT FOUND', 404);
        try{
            // Pour éviter que le jwt.verify lève une exception non traitée
            const decoded = jwt.verify(token, this.secretMailApp);
            if(!decoded) throw new AppError("MAIL VERIFY TOKEN INVALID", 403);
        
            await this.userRepository.activateUser(result.userId);
    
            await this.userRepository.deleteVerificationToken(result.token);
        }catch(error: any){
            throw new AppError(error, 403);
        }
    }
}