import express from 'express' 
import categoryController from '../controllers/category/categoryController.js'

const router = express.Router() 

router.get('/', categoryController.getAll) 
router.get('/edite/:slug', categoryController.update) 
router.post('/edite/:slug', categoryController.update) 
router.post('/delete/:slug', categoryController.delete) 
router.get('/create', categoryController.create) 
router.post('/create', categoryController.create) 

export default router