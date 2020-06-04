import { Router } from 'express';
import PointsController from './controllers/pointsController';
import ItemsController from './controllers/itemsController';

const routes = Router();

routes.get('/items', ItemsController.index);

routes.post('/points', PointsController.create);
routes.get('/points', PointsController.index);
routes.get('/points/:id', PointsController.show);

export default routes;
