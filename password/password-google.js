import passport from 'passport'
import {OAuth2Strategy as googleStrategy} from "passport-google-oauth"
import UserModel from '../models/UserModel.js'

const passwordGoogleStrategy = () => {

    passport.use(new googleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID, 
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGEL_CALLBACK_URL
    },async (token, resfreshToken, profile, done)=>{
        try{
            const foundUser = await UserModel.findOne({email:profile.emails[0].value})
            if (foundUser){
                return done(null, foundUser)
            }
            else{
                const newUser = await new UserModel({
                    username: profile.displayName, 
                    email: profile.emails[0].value, 
                    password: profile.id
                }).save()
                done(null, newUser)
            }
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

export default passwordGoogleStrategy