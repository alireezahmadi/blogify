import express from 'express' 
import commentsController from '../controllers/comments/commentsController.js' 

const router = express.Router() 


router.get('/getAll', commentsController.getAll) 
router.post('/update/:id', commentsController.update) 
router.post('/delete/:id', commentsController.delete) 


export default router