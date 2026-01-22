import type { ITokenService } from "../../domain/security/ITokenService.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv-ts';

dotenv.config();

export class JwtTokenService implements ITokenService{
    private access_secret: string;
    private refresh_secret: string;
    private secretResetPassword: string;

    constructor(){
        if(!process.env.ACCESS_KEY_SECRET) throw new Error("SECRET KEY MISSED: ACCESS_KEY");
        if(!process.env.REFRESH_KEY_SECRET) throw new Error("SECRET KEY MISSED: REFRESH_KEY");
        if(!process.env.SECRET_PASSWORD_RESET_APP) throw new Error("SECRET KEY MISSED: RESET PASSWORD KEY");

        this.access_secret = process.env.ACCESS_KEY_SECRET;
        this.refresh_secret = process.env.REFRESH_KEY_SECRET;
        this.secretResetPassword = process.env.SECRET_PASSWORD_RESET_APP;
    }

    generateAccessToken(payload: { userId: string }){
        const access_key = process.env.ACCESS_KEY_SECRET;
        let token = "";
        if(access_key){
            token = jwt.sign(payload, access_key, { expiresIn: "15m"});
        }
        return token;
    }

    generateRefreshToken(payload: { userId: string }){
        const refresh_key = process.env.REFRESH_KEY_SECRET;
        let token = "";
        if(refresh_key){
            token = jwt.sign(payload, refresh_key, { expiresIn: "7d" });
        }else{
            throw new Error("Server Error");
        }
        
        return token;
    }

    generateRequestResetToken(payload: { userId: string}){
        return jwt.sign(payload, this.secretResetPassword, { expiresIn: "30m" });
    }

    verifyAccessToken(token: string){
        try{
            return jwt.verify(token, this.access_secret) as { userId: string };
        }catch(error){
            return null;
        }
    }

    verifyRefreshToken(token: string){
        try{
            return jwt.verify(token, this.refresh_secret) as { userId: string };
        }catch(error){
            return null;
        }
    }

    verifyResetPasswordToken(token: string){
        try{
            return jwt.verify(token, this.secretResetPassword) as { userId: string };
        }catch(error){
            return null;
        }
    }
}