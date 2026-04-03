import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
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

// CSRF protection: double-submit cookie pattern
// For GET requests, set/refresh the CSRF token cookie
// For state-mutating requests, validate the X-CSRF-Token header against the cookie
const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

app.use((req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    // Ensure CSRF token cookie exists
    if (!req.cookies[CSRF_COOKIE]) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false,   // must be readable by client JS
        sameSite: 'lax',
        secure: config.nodeEnv === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
    return next();
  }

  // Mutating requests: validate CSRF token
  const cookieToken = req.cookies[CSRF_COOKIE] as string | undefined;
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ success: false, error: 'Forbidden: invalid CSRF token' });
  }
  next();
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later' },
  })
);

// Expose current CSRF token to client
app.get('/api/csrf', (req, res) => {
  const token = req.cookies[CSRF_COOKIE] as string | undefined;
  res.json({ success: true, data: { csrfToken: token ?? '' } });
});

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
