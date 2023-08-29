import express from 'express' 
import registerValidator from '../validators/registerValidator.js'
import loginValidator from '../validators/loginValidator.js'
import AuthController from '../controllers/authy/authController.js'
import redirectAuth from '../middleware/redirectAuth.js'
import passport from 'passport'

const router = express.Router() 

router.get('/logout', AuthController.logout)
router.get('/forgotpassword', AuthController.senResetPassword)
router.post('/send/reset/password', AuthController.senResetPassword)
router.get('/change/password/:token', AuthController.changePassword)
router.post('/change/password/:token', AuthController.changePassword)


// redirect to  home page when user is Authenticated
router.use(redirectAuth)
router.get('/register', AuthController.register)
router.post('/register',registerValidator(), AuthController.register) 

router.get('/login', AuthController.login)
router.post('/login', loginValidator(), AuthController.login)

router.get('/google', passport.authenticate('google', {scope:['email', 'profile']}))
router.get('/google/callback', passport.authenticate('google', {successRedirect:'/', failureRedirect:'/auth/login'}))


export default router