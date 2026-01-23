import type { IOTPService } from "../../domain/security/IOTPService.ts";
import speakeasy from 'speakeasy';

export class TOTPService implements IOTPService{

    generateSecret(email: string){
        return speakeasy.generateSecret({ name: email }).base32;
    }
}