import express from 'express';
import authRoutes from './src/infrastructure/web/routes/authRoutes.ts';
import { errorMiddleware } from './src/infrastructure/web/middleware/errorMiddleware.ts';
import cron from 'node-cron';
import { PrismaUserRepository } from './src/infrastructure/repositories/PrismaUserRepository.ts';

const userRepository = new PrismaUserRepository();

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

app.use(errorMiddleware);

cron.schedule('0 0 * * *', () => {
    console.log("Nettoyage de la base de données enclenché.");
    userRepository.cleanupExpiredTokens();
});

app.listen(3000, () => {
    console.log("Server is running on the port 3000.")
});