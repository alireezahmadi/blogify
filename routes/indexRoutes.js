import express from 'express' 
import commentsController from '../controllers/comments/commentsController.js' 
import upgradePanelController from '../controllers/upgradePanel/upgradePanelController.js'
import homePage from '../controllers/home/homeController.js'
import AuthRoutes from './authRoutes.js'
import BlogRoutes from './blogRoutes.js'
import CartRoutes from './cartRoutes.js'
import verifyRequired from '../middleware/verifyRequired.js'


const router = express.Router() 
router.get('/', homePage) 
router.get('/upgrade/panel', upgradePanelController.get)
router.use('/cart', verifyRequired, CartRoutes)
router.post('/comment/create/:slug',verifyRequired,  commentsController.create) 
router.use('/auth', AuthRoutes)
router.use('/blog', BlogRoutes)

export default router