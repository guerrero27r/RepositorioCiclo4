import {Entity, hasMany, model, property} from '@loopback/repository';
import {Mascota} from './mascota.model';

@model()
export class Plan extends Entity {
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
  Nombre: string;

  @property({
    type: 'string',
    required: true,
  })
  Descripcion: string;

  @property({
    type: 'number',
    required: true,
  })
  Precio: number;

  @property({
    type: 'string',
    required: false,
  })
  Foto: string;

  @hasMany(() => Mascota)
  mascotas: Mascota[];

  constructor(data?: Partial<Plan>) {
    super(data);
  }
}

export interface PlanRelations {
  // describe navigational properties here
}

export type PlanWithRelations = Plan & PlanRelations;
