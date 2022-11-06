import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import dotenv from 'dotenv';
import {Usuario} from '../models';
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

  generarClave() {
    let clave = generador(8, false);
    return clave;
  }

  cifrarClave(clave: string) {
    let claveCifrada = cryptoJS.MD5(clave).toString();
    return claveCifrada;
  }

  identificarPersona(usuario: string, clave: string) {
    try {
      const p = this.usuarioRepository.findOne({
        where: {Correo: usuario, Contrasena: clave},
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
