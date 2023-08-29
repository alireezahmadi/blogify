import {body} from 'express-validator' 

const sendEmailValidator = () => {
    return [
        body('email')   
            .not()
            .isEmpty()
            .withMessage("ایمیل نیتواند خالی باشد")
            .isEmail()
            .withMessage('ایمیل موردنظر معتبر نیست'), 
        
       
    ]
}

export default sendEmailValidator