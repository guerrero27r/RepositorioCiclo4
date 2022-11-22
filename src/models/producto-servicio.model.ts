import {Entity, model, property} from '@loopback/repository';

@model()
export class ProductoServicio extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  Tipo: string;

  @property({
    type: 'string',
    required: true,
  })
  Nombre: string;

  @property({
    type: 'string',
    required: true,
  })
  Descripcion: string;

  @property({
    type: 'string',
    required: false,
  })
  Foto: string;

  @property({
    type: 'number',
    required: true,
  })
  Precio: number;

  constructor(data?: Partial<ProductoServicio>) {
    super(data);
  }
}

export interface ProductoServicioRelations {
  // describe navigational properties here
}

export type ProductoServicioWithRelations = ProductoServicio &
  ProductoServicioRelations;
