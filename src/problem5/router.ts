import { Router } from 'express';
import { container } from './container';
import { validate } from './middleware/validate';
import { requestContextMiddleware } from './middleware/request-context';
import { errorHandler } from './middleware/error-handler';
import { productIdParam, createProductSchema, updateProductSchema, listProductsSchema } from './schema/product';
import express from 'express';

const router = Router();

router.use(express.json({ limit: '10kb' }));
router.use(requestContextMiddleware);

router.post('/', validate({ body: createProductSchema }), (req, res, next) => {
  container.getController().create(req, res, next);
});

router.get('/', validate({ query: listProductsSchema }), (req, res, next) => {
  container.getController().list(req, res, next);
});

router.get('/:id', validate({ params: productIdParam }), (req, res, next) => {
  container.getController().getById(req, res, next);
});

router.patch('/:id', validate({ params: productIdParam, body: updateProductSchema }), (req, res, next) => {
  container.getController().update(req, res, next);
});

router.delete('/:id', validate({ params: productIdParam }), (req, res, next) => {
  container.getController().delete(req, res, next);
});

router.use(errorHandler);

export { router as problem5Router };
