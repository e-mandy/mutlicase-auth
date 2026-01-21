import type { IMailerService } from "../../domain/services/IMailerService.ts";
import transporter from '../mailer/nodemailer.ts';

export class NodeMailerService implements IMailerService{
    async sendPasswordResetToken(email: string, token: string){
        return;
    }

    async sendVerificationEmail(email: string, token: string){
        await transporter.sendMail({
            from: process.env.MAILER_ADDRESS,
            to: email,
            subject: "Vérification d'email",
            html: `
                <div>
                    <h1>Multi Auth Test</h1>
                    <p>Cliquez sur le lien pour finaliser la validation de votre compte.</p>
                    <a href="http://localhost:3000/api/auth/verify-email?token=${token}">Lien de vérification</a>
                </div>`
        });
    }
}