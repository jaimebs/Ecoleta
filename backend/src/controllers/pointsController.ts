import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parseItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parseItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    return response.json(points);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').select('*').where('id', id).first();

    if (!point)
      return response.status(404).json({ message: 'Point not found.' });

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return response.json({ point, items });
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const point = {
      image:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    // Criando uma transação para que se uma query falhar da o rollback automático.
    const trx = await knex.transaction();

    // O Knex depois de inserido sempre retorna um array com os ids gerador do banco.
    const insertedIds = await trx('points').insert(point);

    const point_id = insertedIds[0];

    const itemsPoints = items.map((item_id: number) => ({
      item_id,
      point_id,
    }));

    await trx('point_items').insert(itemsPoints);

    // Se deu tudo certo, da um commit da transaction para persistir no banco.
    await trx.commit();

    response.status(201).json({ id: point_id, ...point });
  }
}

export default new PointsController();
