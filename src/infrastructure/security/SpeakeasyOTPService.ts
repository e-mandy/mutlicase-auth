import type { IOTPService } from "../../domain/security/IOTPService.ts";
import speakeasy from 'speakeasy';

export class SpeakeasyOTPService implements IOTPService{
    generateSecret(email: string){
        const secret = speakeasy.generateSecret({
            length: 20,
            name: `MulticaseAuth:${email}`,
            issuer: "MulticaseAuth"
        });

        return secret.base32;
    }

    verifyOTPCode(otp_code: string, secret: string){
        return speakeasy.totp.verify({
            secret: String(secret),
            encoding: 'base32',
            token: otp_code
        });
    }
}