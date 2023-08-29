import autoBind from "auto-bind"; 
import Recaptcha from 'express-recaptcha'


class RecaptchaController {
    constructor(){
        autoBind(this) 
        this.setRecaptcha()
    }

    setRecaptcha() {
        
        this.recaptcha = new Recaptcha.RecaptchaV2(process.env.SITE_KEY_RECAPTCHA, process.env.SECRECT_KEY_RECAPTCHA)
    } 

    validationRecaptcha(req, res){
        return new Promise((resolve, reject)=>{
            this.recaptcha.verify(req, (error, data) => {
                if(error){
                    req.flash('errors', "گزینه امنیتی فعال نمیباشد")
                    res.redirect('/auth/register')

                } else{
                    console.log('data for recaptch', data)
                    resolve(true)
                }
            })
        })
    }
}

export default RecaptchaController