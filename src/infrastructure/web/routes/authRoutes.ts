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
import { LogoutUser } from '../../../application/use-cases/LogoutUser.ts';
import { CodeOTPVerify } from '../../../application/use-cases/CodeOTPVerify.ts';
import { SpeakeasyOTPService } from '../../security/SpeakeasyOTPService.ts';
import { GithubRequest } from '../../../application/use-cases/GithubRequest.ts';
import { SocialLogin } from '../../../application/use-cases/SocialLogin.ts';

const router = express.Router();

const tokenService = new JwtTokenService();
const speakeasyService = new SpeakeasyOTPService();
const userRepository = new PrismaUserRepository();
const nodeMailer = new NodeMailerService();
const loginUseCase = new LoginUser(userRepository, tokenService);
const registerUseCase = new RegisterUser(userRepository, nodeMailer, tokenService);
const emailVerifyUseCase = new EmailVerify(userRepository, tokenService);
const logoutUseCase = new LogoutUser(userRepository);
const verifyOTPUseCase = new CodeOTPVerify(userRepository, speakeasyService, tokenService);
const githubRequestUseCase = new GithubRequest();
const socialLogin = new SocialLogin(userRepository, tokenService);
const auth = new AuthController(
    loginUseCase, 
    registerUseCase, 
    emailVerifyUseCase, 
    logoutUseCase, 
    verifyOTPUseCase,
    githubRequestUseCase,
    socialLogin
);


router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', authMiddleware(tokenService), (req: Request, res: Response) => {
    res.status(200).json(req.user);
});
router.get('/verify-email', auth.emailVerify);
router.post('/verify-otp', auth.verifyOTP);
router.get('/request', auth.githubRequest);
router.get('/callback', auth.githubCallback);

export default router;