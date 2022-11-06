import { /* inject, */ BindingScope, injectable} from '@loopback/core';
const generador = require('password-generator');
const cryptoJS = require('crypto-js');

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  generarClave(){
    // eslint-disable-next-line prefer-const
    let clave = generador(8,false);
    return clave;
  }

  cifrarClave(clave:string){
    // eslint-disable-next-line prefer-const
    let claveCifrada = cryptoJS.MD5(clave).toString();
    return claveCifrada;
  }
}
