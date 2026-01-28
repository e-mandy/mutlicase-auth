import type { LoginUser } from "../../../application/use-cases/LoginUser.ts";
import type { RegisterUser } from "../../../application/use-cases/RegisterUser.ts";
import type { createUserDto } from "../../../domain/dtos/createUserDto.ts";
import type { Response, Request, NextFunction } from 'express';
import { AppError } from "../../../domain/exceptions/AppError.ts";
import { registerSchema } from "../validators/authValidator.ts";
import type { EmailVerify } from "../../../application/use-cases/EmailVerify.ts";
import type { LogoutUser } from "../../../application/use-cases/LogoutUser.ts";
import type { CodeOTPVerify } from "../../../application/use-cases/CodeOTPVerify.ts";
import type { GithubRequest } from "../../../application/use-cases/GithubRequest.ts";
import { GithubExchange } from "../../../application/use-cases/GithubExchange.ts";
import { GithubUserInfo } from "../../../application/use-cases/GithubUserInfo.ts";
import type { SocialLogin } from "../../../application/use-cases/SocialLogin.ts";
import type { Setup2FA } from "../../../application/use-cases/Setup2FA.ts";
import type { Confirm2FA } from "../../../application/use-cases/Confirm2FA.ts";

export class AuthController {
    private loginUseCase: LoginUser;
    private registerUseCase: RegisterUser;
    private emailVerifyUseCase: EmailVerify;
    private logoutUseCase: LogoutUser;
    private codeOTPVerifyUseCase: CodeOTPVerify;
    private githubRequestUseCase: GithubRequest;
    private socialLogin: SocialLogin;
    private setupTwoFactor: Setup2FA;
    private confirm2FA: Confirm2FA;
    private githubExchange: GithubExchange = new GithubExchange();
    private githubUserInfo: GithubUserInfo = new GithubUserInfo();
    private github_url = "https://github.com/login/oauth/authorize";

    constructor(
        loginUseCase: LoginUser, 
        registerUseCase: RegisterUser, 
        emailVerifyUseCase: EmailVerify,
        logoutUseCase: LogoutUser,
        codeOTPVerifyUseCase: CodeOTPVerify,
        githubRequest: GithubRequest,
        socialLogin: SocialLogin,
        setupTwoFactor: Setup2FA,
        confirm2FA: Confirm2FA
    )
    {
        this.loginUseCase = loginUseCase;
        this.registerUseCase = registerUseCase;
        this.emailVerifyUseCase = emailVerifyUseCase;
        this.logoutUseCase = logoutUseCase;
        this.codeOTPVerifyUseCase = codeOTPVerifyUseCase;
        this.githubRequestUseCase = githubRequest;
        this.socialLogin = socialLogin;
        this.setupTwoFactor = setupTwoFactor
        this.confirm2FA = confirm2FA
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
        const token = req.query.token as string;

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

    setup2FA = async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;

        try{
            const qrcode = await this.setupTwoFactor.execute(email);
            return res.status(200).json({
                code: 200,
                qrcode
            });
        }catch(error){
            next(error);
        }

    }

    activate2FA = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.userId as string;
        const { token } = req.body;

        if(!token) throw new AppError('CODE NOT PROVIDED', 400);

        try{
            const result = await this.confirm2FA.execute(userId, token);
            if(!result) throw new AppError('TWO FACTOR AUTHENTICATION ACTIVATION FAILED', 500);

            return res.status(200).json({
                code: 200,
                message: "2FA activated successfully"
            })
        }catch(error){
            next(error);
        }
    }

    verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.body;
        const userId = req.user?.userId as string;

        if(!token) throw new AppError('CODE NOT PROVIDED', 400);

        try{
            const result = await this.codeOTPVerifyUseCase.execute(token, userId);
            if(!result) throw new AppError('OTP VERIFICATION FAILED', 500);

            return res.status(200).json(result);
        }catch(error){
            next(error);
        }

    }

    githubRequest = (req: Request, res: Response, next: NextFunction) => {
        try{

            const params = this.githubRequestUseCase.execute();
            const queryString = new URLSearchParams(params).toString();
            return res.redirect(`${this.github_url}?${queryString}`);

        }catch(error){
            next(error);
        }
    };

    githubCallback = async (req: Request, res: Response, next: NextFunction) => {
        const code = req.query.code as string;
        if(!code) throw new AppError("CODE NOT PROVIDE FROM GITHUB", 500);

        try{
            const access_token = await this.githubExchange.execute(code);
            if(!access_token) throw new AppError("ACCESS TOKEN NOT PROVIDED FROM GITHUB", 500);
    
            const user_info = await this.githubUserInfo.execute(access_token);
            if(!user_info) throw new AppError("USER DATA NOT PROVIDED FROM GITHUB", 500);
    
            const response = await this.socialLogin.execute("GITHUB", user_info.id, user_info.email, false);

            res.cookie('refreshToken', response.refresh_token, {
                httpOnly: true,
                sameSite: 'lax'
            });

            return res.status(200).json({
                access_token: response.access_token,
                
            });
        }catch(error: any){
            next(error);
        }
    };
}