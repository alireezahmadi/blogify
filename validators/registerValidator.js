import {body} from 'express-validator' 
import UserModel from '../models/UserModel.js' 

const registerValidator = () => {
    return[ 
        body('username') 
            .isLength({min:4})
            .withMessage('نام کاربری حداکثر ۴ کاراکاتر باید باشد'), 
        
        body('email')
            
            .isEmail()
            .withMessage('ایمیل موردنظر معتبر نیست')
            .custom(async (value) =>{
                return UserModel.findOne({email:value}).then((user)=>{
                    if (user) Promise.reject("ایمیل قبلا استفاده شده است")
                }) 
            }), 
        body('password')
            .isLength({min:8})
            .withMessage('گذرواژه حداکثر ۸ کاراکاتر باید باشد') 
            .matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*\d)/)
            .withMessage("گذرواژه باید شامل حداقل یک حرف لاتین کوچک و بزرگ و عدد و حروف ویژه باشد")
            
    ]
}

export default registerValidator