import { Router } from 'express';
import { authRouter } from './auth.routes';
import { roleRouter } from './role.routes';
import { periodoRouter } from './periodo.routes';
import { movimientoRouter } from './movimiento.routes';
import { objetivoRouter } from './objetivo.routes';
import { categoriaRouter } from './categoria.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRouter());
apiRouter.use('/roles', roleRouter());
apiRouter.use('/periods', periodoRouter());
apiRouter.use('/movements', movimientoRouter());
apiRouter.use('/objectives', objetivoRouter());
apiRouter.use('/categories', categoriaRouter());

export { apiRouter };
