import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { connectDB } from './db';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import meRouter from './routes/me';
import usersRouter from './routes/users';
import requestsRouter from './routes/requests';
import messagesRouter from './routes/messages';
import reviewsRouter from './routes/reviews';
import flagsRouter from './routes/flags';
import adminRouter from './routes/admin';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/me', meRouter);
app.use('/api/users', usersRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/requests', messagesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/flags', flagsRouter);
app.use('/api/admin', adminRouter);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
});
