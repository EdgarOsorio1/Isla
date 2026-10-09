import { Router } from 'express';
import { autenticar } from '../middleware/auth';
import * as controlador from '../controllers/dashboard.controller';

const router = Router();
router.use(autenticar);

router.get('/', controlador.resumen);

export default router;
