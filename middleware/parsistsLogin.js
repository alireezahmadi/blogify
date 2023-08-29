import UserModel from "../models/UserModel.js"

const parsistLogin = async (req, _res, next)=>{
    if(!req.isAuthenticated()){
        const {remember_token} = req.signedCookies 
        if(remember_token){
            const user = await UserModel.findOne({remember_token})
           
            if(user){
                req.login(user, function(err){
                    if(err) next(err)
                    next()
                })
            }else{
                next()
            }
        }
    }
    next()
}

export default parsistLogin