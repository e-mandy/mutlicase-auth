import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './src/infrastructure/web/routes/authRoutes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);


app.listen(3000, () => {
    console.log("Serveur launched on port 3000");
})