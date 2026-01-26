import type { LoginUser } from "../../../application/use-cases/LoginUser.ts";
import type { RegisterUser } from "../../../application/use-cases/RegisterUser.ts";
import type { createUserDto } from "../../../domain/dtos/createUserDto.ts";
import type { Response, Request, NextFunction } from 'express';
import { AppError } from "../../../domain/exceptions/AppError.ts";
import { registerSchema } from "../validators/authValidator.ts";
import type { EmailVerify } from "../../../application/use-cases/EmailVerify.ts";
import type { LogoutUser } from "../../../application/use-cases/LogoutUser.ts";
import type { CodeOTPVerify } from "../../../application/use-cases/CodeOTPVerify.ts";

export class AuthController {
    private loginUseCase: LoginUser;
    private registerUseCase: RegisterUser;
    private emailVerifyUseCase: EmailVerify;
    private logoutUseCase: LogoutUser;
    private codeOTPVerifyUseCase: CodeOTPVerify;

    constructor(
        loginUseCase: LoginUser, 
        registerUseCase: RegisterUser, 
        emailVerifyUseCase: EmailVerify,
        logoutUseCase: LogoutUser,
        codeOTPVerifyUseCase: CodeOTPVerify
    )
    {
        this.loginUseCase = loginUseCase;
        this.registerUseCase = registerUseCase;
        this.emailVerifyUseCase = emailVerifyUseCase;
        this.logoutUseCase = logoutUseCase;
        this.codeOTPVerifyUseCase = codeOTPVerifyUseCase;
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
            const result = await this.loginUseCase.execute(email, password, { ip, userAgent });

            if(result.twoFactorActive){
                return res.status(200).json(result);
            }

            res.cookie('refreshToken', result.refresh_token, {
                httpOnly: true,
                sameSite: 'lax'
            });

            return res.status(200).json({
                accessToken: result.access_token,
                user: result.user
            });
        }catch(error: any){
            if(error.name == 'INVALID CREDENTIALS') return res.status(401).json({
                message: "Invalid credentials"
            })
        }
    };

    logout = (req: Request, res: Response, next: NextFunction) => {
        const refresh_token = req.cookies.refreshToken;
        const access_token = req.headers.authorization;

        if(!refresh_token || !access_token) throw new AppError('INVALID TOKEN', 401);
        try{
            const result = this.logoutUseCase.execute(refresh_token, access_token);
            if(!result) throw new AppError("LOGOUT FAILED", 500);
            
            return res.json({
                code: 200,
                message: "User logged out successfully"
            })
        }catch(error){
            next(error)
        }
    };

    emailVerify = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.params.token as string;

        if(!token) throw new AppError('INVALID TOKEN', 400);
        
        try{
            const result = this.emailVerifyUseCase.execute(token);

            return res.status(200).json({
                code: 200,
                data: {
                    ...result
                }
            });
        }catch(error){
            next(error);
        }
    }

    verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.body;
        const userId = req.user?.userId as string;

        try{
            const result = await this.codeOTPVerifyUseCase.execute(token, userId);
            if(!result) throw new AppError('OTP VERIFICATION FAILED', 500);

            return res.status(200).json(result);
        }catch(error){
            next(error);
        }

    }
}