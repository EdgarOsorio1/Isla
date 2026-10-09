import { ah } from '../utils/asincrono';
import * as modelo from '../models/dashboard.model';

export const resumen = ah(async (req, res) => {
  res.json(await modelo.resumen(req.usuario!));
});
