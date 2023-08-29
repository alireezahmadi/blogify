import passport from "passport";
import localStrategy from 'passport-local'
import UserModel from "../models/UserModel.js";


const passwordLocalStrategy = () => {
    passport.use('local.register', new localStrategy({
        usernameField: 'email',
        passportField: 'password',
        passReqToCallback: true
    }, async (req, email, password, done) => {
        try{
            const userFound = await UserModel.findOne({ email: email })
            if (userFound) return done(null, false, req.flash('errors', "کاربری قبلا با این مشخصات ثبت نام کرده است"))
            const newUser = await new UserModel({
                username: req.body.username,
                email: email,
                password: password
            }).save()
            done(null, newUser)
        }
        catch(err){
            done(err, false, req.flash('errors','مکان ذخیره سازی اطلاعات وجود ندارد'))
        }
        
           

    }));
     
    passport.use('local.login', new localStrategy({
        usernameField: 'email',
        passportField:'password', 
        passReqToCallback:true
    }, async(req, email, password, done)=>{
        try{
            const user = await UserModel.findOne({email})
            if(!user) return done(null, false, req.flash('errors', 'کاربری یافت نشد'))
            const comparePassword =  await user.comparePassword(password)
            if(!comparePassword) return done(null, false, req.flash('errors','کاربری با این مشخصات یافت نشد')) 
          
            done(null, user)
        }   
        catch(err){done}
    }))

 
    passport.serializeUser(function (user, done) {
       
        return done(null, user.id);
    
    });
    
    passport.deserializeUser(function (id, done) {
        
        UserModel.findById(id)
            .then(user => {
                return done(null, user);
    
            })
            .catch(done)
    
    });
}

export default passwordLocalStrategy