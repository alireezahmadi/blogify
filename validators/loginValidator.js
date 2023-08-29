import {body} from 'express-validator' 

const loginValidator = () => {
    return [
        body('email')   
            .not()
            .isEmpty()
            .withMessage("ایمیل نیتواند خالی باشد")
            .isEmail()
            .withMessage('ایمیل موردنظر معتبر نیست'), 
        
        body("password")
            .isLength({min:8})
            .withMessage('گذرواژه حداکثر ۸ کاراکاتر باید باشد') 
    ]
}

export default loginValidator