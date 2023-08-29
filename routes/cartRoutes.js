import express from 'express' 

import CartController from '../controllers/cart/cartController.js' 

const router = express.Router() 

router.get('/', CartController.get)
router.post('/delete/:id',  CartController.delete)
router.post('/create/:id', CartController.create)
router.post('/payment/:id', CartController.processPayment)

export default router