import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { jwtMiddleware } from './middleware/auth.jwt';

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(jwtMiddleware);

app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

export default app;
