import type { NextFunction } from "express";
import type { ITokenService } from "../../../domain/security/ITokenService.js";
import { JwtTokenService } from "../../security/JwtTokenService.js";
import type { Response, Request } from 'express';

export const authMiddleware = (tokenService: ITokenService) => {
    return (req: Request, res: Response, next: NextFunction) => {

        const authorization = req.headers.authorization;
        
        if(!authorization) return res.status(401).json({
            message: "UNAUTHORIZED ACCESS"
        });
        const token = authorization.split(' ')[1];

        if(!token) return res.status(400).json({
            message: "UNAUTHORIZED ACCESS"
        });
        try{
            const decoded = tokenService.verifyAccessToken(token);
            if(!decoded) return res.status(401).json({
                message: 'Unauthorized access'
            });

            req.user = decoded;
            next();
            
        }catch(error: any){
            if(error.name == "SECRET KEY MISSED: ACCESS_KEY" || error.name == "SECRET KEY MISSED: REFRESH_KEY:s") return res.status(500).json({
                message: 'Intern Server secret problem'
            });

            res.status(401).json({
                message: "UNAUTHORIZED ACCESS"
            });
        }
    }
}