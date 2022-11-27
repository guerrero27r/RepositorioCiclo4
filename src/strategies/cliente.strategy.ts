import {AuthenticationStrategy} from '@loopback/authentication';
import {service} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';

import parseBearerToken from 'parse-bearer-token';
import {AutenticacionService} from '../services';

export class EstrategiaCliente implements AuthenticationStrategy {
  name: string = 'Cliente';

  constructor(
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = parseBearerToken(request);
    if (!token) {
      throw new HttpErrors[401]('Token no existe en la solicitud');
    }
    let datos = this.servicioAutenticacion.validarTokenJWT(token);
    if (token) {
      if (datos) {
        if (datos.data.rol == 'Cliente') {
          let perfil: UserProfile = Object.assign({
            id: datos.data.id,
            nombre: datos.data.nombre,
            correo: datos.data.correo,
            rol: datos.data.rol,
          });
          return perfil;
        }
      } else {
        throw new HttpErrors[401]('Token Valido pero no tiene permisos');
      }
    } else {
      throw new HttpErrors[401]('No incluyo Token');
    }
  }
}
