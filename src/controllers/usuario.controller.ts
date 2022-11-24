import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {
  CambioClave,
  Credenciales,
  NotificacionCorreo,
  Usuario,
} from '../models';
import {UsuarioRepository} from '../repositories';
import {AutenticacionService, NotificacionService} from '../services';
const fetch = require('node-fetch');

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService,
    @service(NotificacionService)
    public servicioNotificacion: NotificacionService,
  ) {}

  @post('/identificarPersona', {
    responses: {
      '200': {
        description: 'Identificacion de usuarios',
      },
    },
  })
  async identificarPersona(@requestBody() credenciales: Credenciales) {
    let p = await this.servicioAutenticacion.identificarPersona(
      credenciales.Usuario,
      credenciales.Contrasena,
    );
    if (p) {
      let token = this.servicioAutenticacion.generarTokenJWT(p);
      return {
        datos: {
          nombre: p.Nombre,
          correo: p.Correo,
          id: p.id,
        },
        tk: token,
      };
    } else {
      throw new HttpErrors[401]('Datos Invalidos');
    }
  }

  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, 'id'>,
  ): Promise<Usuario> {
    let clave = this.servicioAutenticacion.generarClave();
    let claveCifrada = this.servicioAutenticacion.cifrarClave(clave);
    usuario.Contrasena = claveCifrada;
    let p = await this.usuarioRepository.create(usuario);

    //Notificar al usuario
    let destino = usuario.Correo;
    let asunto = 'Datos de registro en la plataforma';
    let contenido = `Hola ${usuario.Nombre} bienvenido a la plataforma de Mascota Feliz, su usuario es ${usuario.Correo} y su contraseña es ${clave}`;
    fetch(
      `http://127.0.0.1:5000/email?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`,
    ).then((data: any) => {
      console.log(data);
    });
    return p;
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Usuario) where?: Where<Usuario>): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'})
    filter?: FilterExcludingWhere<Usuario>,
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  @post('/cambiar-contrasena')
  @response(200, {
    description: 'Cambio Clave Usuario',
    content: {'application/json': {schema: getModelSchemaRef(CambioClave)}},
  })
  async CambiarClave(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CambioClave, {
            title: 'Cambio de clave del Usuario',
          }),
        },
      },
    })
    CredencialesClave: CambioClave,
  ): Promise<Boolean> {
    let usuario = await this.servicioAutenticacion.cambiarClave(
      CredencialesClave,
    );
    if (usuario) {
      //servicio notificacion correo
      let datos = new NotificacionCorreo();
      datos.destinatario = usuario.Correo;
      datos.asunto = 'Cambio de Contraseña';
      datos.mensaje = `Hola <b>${usuario.Nombre}</b>,  Cambiaste de Contraseña si no fuiste tu ingresa a la pagina y recupera tu contraseña desde la opcion recuperar contraseña`;
      this.servicioNotificacion.EnviarCorreo(datos);
    }
    return usuario != null;
  }

  @post('/recuperar-contrasena')
  @response(200, {
    description: 'Recuperar Clave Usuario',
    content: {'application/json': {schema: {}}},
  })
  async RecuperarClave(
    @requestBody({
      content: {
        'application/json': {},
      },
    })
    Correo: string,
  ): Promise<Usuario | null> {
    let usuario = await this.servicioAutenticacion.RecuperarClave(Correo);
    if (usuario) {
      //servicio notificacion correo
      let datos = new NotificacionCorreo();
      datos.destinatario = usuario.Correo;
      datos.asunto = 'Cambio de Contraseña';
      datos.mensaje = `Hola <b>${usuario.Nombre}</b>,recuperaste tu contraseña desde la opción recuperar contraseña puedes cambiar la contraseña desde esa opción en la pagina `;
      this.servicioNotificacion.EnviarCorreo(datos);
    }
    return usuario;
  }
}
