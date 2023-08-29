import express from 'express' 
import BlogController from '../controllers/blogs/blogController.js'
import IpAdress from '../middleware/IpAddress.js'

const router = express.Router() 

router.get('/:slug', IpAdress, BlogController.get)
router.get('/', BlogController.getAll)
router.get('/author/:author', BlogController.getAuthorBlogs)
router.get('/category/:category', BlogController.getCategoryBlogs)

export default router