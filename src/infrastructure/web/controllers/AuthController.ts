import type { LoginUser } from "../../../application/use-cases/LoginUser.ts";
import type { RegisterUser } from "../../../application/use-cases/RegisterUser.ts";
import type { createUserDto } from "../../../domain/dtos/createUserDto.ts";
import type { Response, Request, NextFunction } from 'express';
import { AppError } from "../../../domain/exceptions/AppError.ts";
import { registerSchema } from "../validators/authValidator.ts";
import type { EmailVerify } from "../../../application/use-cases/EmailVerify.ts";

export class AuthController {
    private loginUseCase: LoginUser;
    private registerUseCase: RegisterUser;
    private emailVerifyUseCase: EmailVerify;

    constructor(loginUseCase: LoginUser, registerUseCase: RegisterUser, emailVerifyUseCase: EmailVerify){
        this.loginUseCase = loginUseCase;
        this.registerUseCase = registerUseCase;
        this.emailVerifyUseCase = emailVerifyUseCase;
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        if(!req.body) throw new AppError("INVALID CREDENTIALS", 400);
        
        try{
            registerSchema.parse(req.body);
            let credentials = req.body as createUserDto;
            const result = await this.registerUseCase.execute(credentials);
            return res.status(200).json(result);

        }catch(error: any){
            next(error);
        }
    };

    login = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];

        if(!ip || !userAgent) throw new AppError('DEVICE NOT IDENTIFIED', 401);

        try{
            const user = await this.loginUseCase.execute(email, password, { ip, userAgent });

            res.cookie('refreshToken', user.refresh_token, {
                httpOnly: true,
                sameSite: 'lax'
            });

            return res.status(200).json({
                accessToken: user.access_token,
                user: user.user
            });
        }catch(error: any){
            if(error.name == 'INVALID CREDENTIALS') return res.status(401).json({
                message: "Invalid credentials"
            })
        }
    };

    emailVerify = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.params.token as string;

        if(!token) throw new AppError('INVALID TOKEN', 400);
        
        try{
            this.emailVerifyUseCase.execute(token);
        }catch(error){
            next(error);
        }
    }
}