import express from 'express'
import BlogController from '../controllers/blogs/blogController.js'
import fileUploads from '../middleware/FileUploads.js' 
import multerConfig from '../config/multerConfig.js' 
import blogValidators from '../validators/blogValidator.js'
import authController from '../controllers/authy/authController.js'
import IsAdmiOrUser from '../middleware/isAdminOrUser.js'
import UpgradePanelRoutes from './upgradePanelRoutes.js'
import categoryRoutes from './categoryRoutes.js'
import commentRoutes from './commentRoutes.js'

import roleList from '../config/roleList.js'
import verifyRequired from '../middleware/verifyRequired.js'
import verifyRoles from '../middleware/verifyRoles.js' 

const router = express.Router() 

router.use(verifyRequired)

router.use((req, res, next)=>{
    res.locals.layout = 'pannel/master'
   
    next()
})

router.get('/', (req, res)=>{
    res.render('pannel/home/index')
})
router.get('/blogs/', verifyRoles(roleList.Admin), BlogController.getAllBlogs)
router.get('/blogs/create', verifyRoles(roleList.Admin, roleList.Author), BlogController.create)
router.post('/blogs/create', verifyRoles(roleList.Admin, roleList.Author),multerConfig.single('image'), fileUploads, blogValidators(), BlogController.create)
router.get('/blogs/update/:slug', verifyRoles(roleList.Admin, roleList.Author), BlogController.update)
router.post('/blogs/update/:slug', verifyRoles(roleList.Admin, roleList.Author), multerConfig.single('image'), fileUploads, blogValidators(), BlogController.update)
router.post('/blogs/delete/:slug', verifyRoles(roleList.Admin), BlogController.delete)


router.get('/profile/:email',IsAdmiOrUser, authController.profile) 
router.post('/profile/edite/:email',IsAdmiOrUser ,authController.editeProfile) 
router.get('/users', verifyRoles(roleList.Admin) ,authController.getAllUsers) 
router.use('/comment', verifyRoles(roleList.Admin), commentRoutes )
router.use('/categories',verifyRoles(roleList.Admin), categoryRoutes )
router.use('/upgrade',verifyRoles(roleList.Admin),  UpgradePanelRoutes)


export default router