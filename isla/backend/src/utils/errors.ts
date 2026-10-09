export class HttpError extends Error {
  constructor(public status: number, mensaje: string, public detalles?: { campo: string; mensaje: string }[]) {
    super(mensaje);
  }
}
