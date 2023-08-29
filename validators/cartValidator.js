import {body} from 'express-validator'
import UserModel from '../models/UserModel.js'
import UpgradePanelModel from '../models/upgradePanelModel.js'

const cartValidator = () => {
    return [
        body('panel')
            .custom(async(value)=>{
                if(!value){
                    throw new Error('پنل مورد نظر را انتخاب کنید')
                } 
                const panel = await UpgradePanelModel.findOne({value}) 
                if(!panel){
                    throw new Error('پنلی یافت نشد')
                }
            }), 
        body('user')
            .custom(async(value)=>{
                if(!value){
                    throw new Error('کاربر یافت نشد')
                } 
                const panel = await UserModel.findOne({value}) 
                if(!panel){
                    throw new Error('کاربر یافت نشد')
                }
            }),
    ]
}

export default cartValidator