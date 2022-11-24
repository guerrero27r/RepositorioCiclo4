import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import dotenv from 'dotenv';
import {CambioClave, Usuario} from '../models';
import {UsuarioRepository} from '../repositories';

dotenv.config();

const generador = require('password-generator');
const cryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
  ) {}

  /*
   * Add service methods here
   */

  async cambiarClave(CredencialesClave: CambioClave): Promise<Usuario | null> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        id: CredencialesClave.id_usuario,
        Contrasena: CredencialesClave.Clave_actual,
      },
    });
    if (usuario) {
      usuario.Contrasena = CredencialesClave.Nueva_clave;
      await this.usuarioRepository.updateById(
        CredencialesClave.id_usuario,
        usuario,
      );
      return usuario;
    } else {
      return null;
    }
  }

  generarClave() {
    let Contrasena = generador(8, false);
    return Contrasena;
  }

  cifrarClave(Contrasena: string) {
    let claveCifrada = cryptoJS.MD5(Contrasena).toString();
    return claveCifrada;
  }

  identificarPersona(usuario: string, Contrasena: string) {
    try {
      const p = this.usuarioRepository.findOne({
        where: {Correo: usuario, Contrasena: Contrasena},
      });
      if (p) {
        return p;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  generarTokenJWT(usuario: Usuario) {
    let token = jwt.sign(
      {
        data: {
          id: usuario.id,
          correo: usuario.Correo,
          nombre: usuario.Nombre,
          apellido: usuario.Apellido,
        },
      },
      process.env.CLAVE_JWT,
    );
    return token;
  }
  validarTokenJWT(token: string) {
    try {
      let datos = jwt.verify(token, process.env.CLAVE_JWT);
      return datos;
    } catch (error) {
      return false;
    }
  }
}
