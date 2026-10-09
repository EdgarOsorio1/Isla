import { Router } from 'express';
import { autenticar } from '../../middlewares/auth';
import { ah } from '../../utils/asincrono';
import * as servicio from './dashboard.service';

const router = Router();
router.use(autenticar);

router.get('/', ah(async (req, res) => {
  res.json(await servicio.resumen(req.usuario!));
}));

export default router;
