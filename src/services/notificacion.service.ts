import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import dotenv from 'dotenv';
import {NotificacionCorreo} from '../models';
const fetch = require('node-fetch');

dotenv.config();

@injectable({scope: BindingScope.TRANSIENT})
export class NotificacionService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  EnviarCorreo(datos: NotificacionCorreo) {
    fetch(
      `http://127.0.0.1:5000/email?correo_destino=${datos.destinatario}&asunto=${datos.asunto}&contenido=${datos.mensaje}`,
    ).then((res: any) => {
      console.log(res.text());
    });
  }
}
