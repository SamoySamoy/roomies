import { Router } from 'express';

import authRouter from './auth';
import profilesRouter from './profiles';
import roomsRouter from './rooms';
import groupsRouter from './groups';
import verifyToken from '@/middlewares/verifyToken';
import membersRouter from './members';
import messagesRouter from './messages';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/profiles', verifyToken, profilesRouter);
apiRouter.use('/rooms', verifyToken, roomsRouter);
apiRouter.use('/groups', verifyToken, groupsRouter);
apiRouter.use('/members', verifyToken, membersRouter);
apiRouter.use('/messages', verifyToken, messagesRouter);

export default apiRouter;
