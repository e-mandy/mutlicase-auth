import type { LoginUser } from "../../../application/use-cases/LoginUser.ts";
import type { RegisterUser } from "../../../application/use-cases/RegisterUser.ts";
import type { createUserDto } from "../../../domain/dtos/createUserDto.ts";
import type { Response, Request } from 'express';

export class AuthController {
    private loginUseCase: LoginUser;
    private registerUseCase: RegisterUser;

    constructor(loginUseCase: LoginUser, registerUseCase: RegisterUser){
        this.loginUseCase = loginUseCase;
        this.registerUseCase = registerUseCase;
    }

    register = async (req: Request, res: Response) => {
        try{
            let credentials = req.body as createUserDto;
            const result = await this.registerUseCase.execute(credentials);
            return res.status(200).json(result);

        }catch(error: any){
            if(error.name == "BAD CREDENTIALS") return res.status(400).json({
                message: "Invalid credentials"
            })

            if(error.name == 'USER_ALREADY_EXISTS') return res.status(409).json({
                message: error.message
            });

            return res.status(500).json({
                message: error.message
            });
        }
    };


    login = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        try{
            const user = await this.loginUseCase.execute(email, password);

            res.cookie('refreshToken', user.refresh_token, {
                httpOnly: true,
                sameSite: 'strict'
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
}