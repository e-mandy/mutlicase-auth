import express from 'express';
import { AuthController } from '../controllers/AuthController.ts';
import { LoginUser } from '../../../application/use-cases/LoginUser.ts';
import { RegisterUser } from '../../../application/use-cases/RegisterUser.ts';
import { PrismaUserRepository } from '../../repositories/PrismaUserRepository.ts';
import { JwtTokenService } from '../../security/JwtTokenService.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import type { Response, Request } from 'express';
import { NodeMailerService } from '../../services/NodeMailService.ts';
import { EmailVerify } from '../../../application/use-cases/EmailVerify.ts';

const router = express.Router();

const tokenService = new JwtTokenService();
const userRepository = new PrismaUserRepository();
const nodeMailer = new NodeMailerService();
const loginUseCase = new LoginUser(userRepository, tokenService);
const registerUseCase = new RegisterUser(userRepository, tokenService, nodeMailer);
const emailVerifyUseCase = new EmailVerify(userRepository);
const auth = new AuthController(loginUseCase, registerUseCase, emailVerifyUseCase);


router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', authMiddleware(tokenService), (req: Request, res: Response) => {
    res.status(200).json(req.user);
});
router.get('/verify-email/:token', )
router.get('/verify-reset-password-token', )

export default router;