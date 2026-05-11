import express from 'express';
import { getProducts, createProduct, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

// Public route to fetch products for the store
router.get('/', getProducts);

// Admin routes (For MVP, using open endpoints for the component simulation)
router.post('/', createProduct);
router.delete('/:id', deleteProduct);

export default router;
