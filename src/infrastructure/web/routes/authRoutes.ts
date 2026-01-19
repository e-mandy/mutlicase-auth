import express from 'express';
import { AuthController } from '../controllers/AuthController.ts';
import { LoginUser } from '../../../application/use-cases/LoginUser.ts';
import { RegisterUser } from '../../../application/use-cases/RegisterUser.ts';
import { PrismaUserRepository } from '../../repositories/PrismaUserRepository.ts';
import { JwtTokenService } from '../../security/JwtTokenService.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import type { Response, Request } from 'express';

const router = express.Router();

const tokenService = new JwtTokenService();
const userRepository = new PrismaUserRepository();
const loginUseCase = new LoginUser(userRepository, tokenService);
const registerUseCase = new RegisterUser(userRepository, tokenService);
const auth = new AuthController(loginUseCase, registerUseCase);


router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', authMiddleware(tokenService), (req: Request, res: Response) => {
    res.status(200).json(req.user);
});

export default router;