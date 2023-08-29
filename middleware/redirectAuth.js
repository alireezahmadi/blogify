import AppError from "../utils/AppError.js"
const redirectAuth = (req, res, next)=>{
    if(req?.isAuthenticated()) return new AppError('ابتدا وارد سایت شوید', 400)
    next()
}

export default redirectAuth