import AppError from "../utils/AppError.js"
const IsAdmiOrUser = (req, res, next) =>{
    
    const email = req.params['email']
    if(req.user.roles.Admin || req.user.email == email){
        return next()
    }
    return new AppError('فقط خود کاربر یا مدیر سایت اجازه دسترسی به محتوای این بخش دارد', 401)
}

export default IsAdmiOrUser