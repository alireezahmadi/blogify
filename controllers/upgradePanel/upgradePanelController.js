import autoBind from "auto-bind";
import {validationResult} from 'express-validator'
import catchFunction from '../../utils/catchFunction.js'
import UpgradePanelModel from "../../models/upgradePanelModel.js"; 

class UpgradePanelController{
    constructor(){
        autoBind(this)
    } 

    back(req, res){
        res.redirect(req.header('Referer')|| '/')
    }

    async validateForm(req){
        const result = await validationResult(req) 
        if(!result.isEmpty()){
            const errors = result.array() 
            let message = [] 
            errors.forEach(err => message.push(err.msg)) 
            req.flash('errors', message)
            return false 

        }
        return true
    }

    get = catchFunction(async(req, res, next)=>{
        const panels = await UpgradePanelModel.find() 
        res.render('upgradePanel/index', {panels})
    })

    create = catchFunction(async (req, res, next)=>{
        if(req.method == 'GET'){

            const errorsMsg = req.flash('errors')
            const successMsg = req.flash('success') 
            res.render('pannel/upgradePanel/create', {errorsMsg, successMsg})
        }
        if(req.method == 'POST'){
            const body  = req.body 
            const result = await this.validateForm(req) 
            if(!result) return this.back(req, res)
            await new UpgradePanelModel({...body, price:Number(body.price)}).save()
            req.flash('success', `پنل "${body.title}" با موفقیت ایجاد شد`)
            this.back(req, res)
        }
        
        
    })

 

}

export default new UpgradePanelController()