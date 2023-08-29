import RecaptchaController from "./recaptchaController.js";
import { validationResult } from 'express-validator'
import passport from "passport";
import resetPasswordModel from "../../models/resetPasswordModel.js";
import uniqueString from "unique-string";
import UserModel from '../../models/UserModel.js'
import roleList from '../../config/roleList.js'
import sendResetPasswordCode from "../../utils/mailer.js";
import catchFunction from "../../utils/catchFunction.js";
import AppError from '../../utils/AppError.js'

class AuthController extends RecaptchaController {

  async validationForm(req) {
    const result = await validationResult(req)
    let massages = []
    if (!result.isEmpty()) {
      const errors = result.array()
      errors.forEach(err => massages.push(err.msg))
      req.flash('errors', massages)
      return false
    }
    return true
  }

  register =catchFunction(async (req, res, next)=> {
    if (req.method === 'GET') {
     
      res.render('auth/register', { messages: req.flash('errors') })

    }
    else if (req.method === 'POST') {

      const result = await this.validationForm(req)
      if (!result) return res.redirect('/auth/register')

      await passport.authenticate('local.register', {
        successRedirect: '/',
        failureRedirect: '/auth/register',
        failureFlash: true
      })(req, res, next)



    }
  }) 

  login = catchFunction(async(req, res, next)=> {
    if (req.method === 'GET') {
      const errors = req.flash('errors')
      res.render('auth/login', { messages: errors })
    }
    else if (req.method == 'POST') {

      const result = await this.validationForm(req)
      if (!result) return res.redirect('/auth/login')
      await passport.authenticate('local.login', (err, user) => {

        if (err || !user) {
          return res.redirect('/auth/login')
        }
       

        req.login(user, function (err) {

          if (err) {
            return next(err)
          }
         

          if (req.body.remember) {
  
            user.rememberLogin(res)
          }
          return res.redirect('/')
        })

      })(req, res, next)
    }
  })

  
  
  logout = catchFunction(async(req, res, next) => {
    req.logout(function(err){
      if(err) return next(err)
      res.clearCookie('remember_token')
      res.redirect('/auth/login')
      
    })
  })

  senResetPassword = catchFunction(async(req, res, next) =>{
    if(req.method === "GET"){
      const errors = req.flash('errors')
      const success = req.flash('success')
      res.render('auth/forgot-password', {messages: errors, suucessMessage:success})
    }
    else if(req.method === 'POST'){
      const result = await this.validationForm(req) 
      if(!result) return res.redirect('/auth/forgotpassword')
      const {email} = req.body 
      const userFound = await UserModel.findOne({email}) 
      if(!userFound){
        req.flash('errors', 'کاربری با این ایمیل ثبت نام نکرده است')
        return res.redirect('/auth/forgotpassword')
      } 
      await resetPasswordModel.findOneAndDelete({user:userFound.id})
      const token = uniqueString() 
      await new resetPasswordModel({
        user:userFound._id, 
        token
      }).save() 
      const url = `http://localhost:3000/auth/change/password/${token}`
      sendResetPasswordCode(userFound.email, userFound.username, url)
      console.log('token\n ', token)
      req.flash('success', 'لینک بازیابی رمز ورود به ایمیل شما ارسال شده است')
      res.redirect('/auth/forgotpassword')
    }
  })

  changePassword = catchFunction(async(req, res, next)=>{
    if(req.method === 'GET'){
      const errors = req.flash('errors')
      const success = req.flash('success')
      res.render('auth/change-password',{messages:errors, suucessMessage:success})
    }
    if(req.method === 'POST'){
      const {password} = req.body 
      const token = req.params['token'] 
      if(!passport || !token){
        req.flash('errors','گذرواژه یا توکن معتبر نیست')
        return res.redirect(req.header('Referer')|| '/')
      }
      const resetPwdModel = await resetPasswordModel.findOne({token}) 
      if(!resetPwdModel){
        req.flash('errors', 'توکن موردنظر نیست یا منقضی شده است')
        return res.redirect(req.header('Referer')|| '/')
      }
      const userId = resetPwdModel.user
      const userFound = await UserModel.findByIdAndUpdate(userId, {password}, {new:true})
      if(!userFound){
        req.flash('errors', 'کاربری یافت نشد')
        return res.redirect(req.header('Referer')|| '/')
      } 
      await resetPwdModel.deleteOne() 
      req.flash('success', 'رمز عبور شما باموفقیت تغییر یافت')
      res.redirect('/auth/login')
    }
   
  })

  profile = catchFunction(async(req, res, next)=>{
    const email = req.params['email']
    let user = await UserModel.findOne({email}).populate('comments')
    const roles = Object.values(user.roles).filter(Boolean)
    const date = new Date(user.specialUser )
    const year = date.getFullYear()
    const month = (date.getMonth()+1).toString().length == 1 ? '0'+(date.getMonth() + 1):(date.getMonth() + 1)
    const day =  (date.getDate()+1).toString().length == 1 ? '0'+(date.getDate() + 1):(date.getDate() + 1)
    const dateString = `${year}-${month}-${day}`
    const profile  = {
      username: user.username,
      email: user.email,
      roles,
      specialUser: dateString || 0,
      isSpecialUser: user.isSpecialUser() ,
      comments: user.comments?.length
    }
   //res.json(profile)
   res.render('pannel/profile/index',{profile})
  })

  editeProfile = catchFunction(async(req, res, next)=>{
   
      const email = req.params['email'] 
      const body = req.body
      const userFound = await UserModel.findOne({email}).exec()
      if(!userFound){
      console.log(' not found**', )
        return next(new AppError('کاربری یافت نشد', 400))
      } 
      if(!userFound.roles.Admin){
        body.roles =Object.values(userFound.roles).filter(Boolean)
        body.specialUser = userFound.specialUser 
        body.email = userFound.email
        
      }
    
      if(!Array.isArray(body?.roles)){
        body.roles = [body.roles]
      }
      

      
      let roles = {}
      
      body.roles.forEach(role => {
        if(roleList.Admin == role){
          roles.Admin = Number(role) 
        }
        if(roleList.Author == role){
          roles.Author = Number(role) 
        }
        if(roleList.User == role){
          roles.User = Number(role) 
        }
        body.roles = roles
      })
      
  
      await userFound.updateOne({...body})
      res.redirect(req.header('Referer'))

  })

  getAllUsers = catchFunction(async(req, res, next)=>{
    const pageNum = req.query.pageNum || 1
    const pageLimit = req.query.pageLimit || 3 

    const options = {
      page:pageNum, 
      limit:pageLimit
    }
    const userModelAggregate = UserModel
                                .aggregate() 
                                .project({
                                  username: 1,
                                  email: 1,
                                  roles: 1, 
                                  specialUser: 1
                                  })
                                .sort({createdAt:-1})
    const users = await UserModel.aggregatePaginate(
      userModelAggregate, 
      options
      )
    
    res.render('pannel/users/index', {users})
  })
}

export default new AuthController()
