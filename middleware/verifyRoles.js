import AppError from "../utils/AppError.js"

const verifyRoles = (...ROLE_LIST) => {
    return (req, res, next) => {
        if(!req.user.roles) return res.redirect('/')
        const rolesArray = [...ROLE_LIST] 
        const roles = Object.values(req.user.roles).filter(Boolean)
     
        const result = roles
                        .map(role => rolesArray.includes(role))
                        .find(val => val == true)
        
                      
        if(!result)return next(new AppError('اجازه دسترسی به محتوای سایت رو ندارید', 400))
        
        next() 
    }
}

export default verifyRoles