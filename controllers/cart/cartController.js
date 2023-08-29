import CartModel from '../../models/cartModel.js'
import UpgradePanelModel from '../../models/upgradePanelModel.js'
import autoBind from 'auto-bind'
import catchFunction from '../../utils/catchFunction.js'
import AppError from '../../utils/AppError.js'

class CartController{
    constructor(){
        autoBind(this)
    }

    back(req, res){
        res.redirect(req.header('Referer'))
    }

    get = catchFunction(async (req, res, next)=>{
        const cart = await CartModel.findOne({user:req.user.id}).populate([
            {
                path:'panel', 
                select:'title status price'
            },
            {
                path:'user', 
                select:'id'
            }
        ]) 

        res.render('cart/index', {cart})
    })

    create = catchFunction(async (req, res, next)=>{
        const id = req.params['id'] 
        const user = req.user
        
        const upgradePanel = await UpgradePanelModel.findById(id) 
        if(!upgradePanel && !user){
          
           return next(new AppError('کاربر یا پنل مورد نظر مشخص نیست', 400))
        }
        if(user.panel.id === upgradePanel.id){
           
            return next(new AppError('پنل کاربردی شما در حال حاضر فعال است', 400))
        } 
        await CartModel.findOneAndDelete({user:req.user.id})
        await new CartModel({
            panel:upgradePanel.id, 
            user: req.user.id
         }).save() 

        res.redirect('/cart')
    })

    delete = catchFunction(async (req, res, next)=>{
        const id = req.params['id'] 
        const cart = await CartModel.findByIdAndDelete(id) 
        if(!cart){
            return next(new AppError( 'پنل مورد نظر یافت نشد', 400))
        }
        res.redirect('/')
    })

    processPayment = catchFunction(async (req, res, next)=>{
        const id = req.params['id']
            let data = {}
            const user = req.user
            const cart = await CartModel.findById(id).populate('panel')
            if(!cart){
                return next(new AppError('سبد خریدی با این مشخصات یافت نشد',400))
            }
            if(user.panel.id == cart.id){
                return next(new AppError('پنل موردنظر شما ا ز قبل فعال بوده است',400))
            } 
           if(['Advance', 'EnterPrise'].includes(cart.panel.status)){
                const status = cart.panel.status
                let day = status == 'Advance' ? 5 : status == 'EnterPrise'? 10 : 0
                let dateNow = new Date()
                let spcialDateUser = new Date() 
                spcialDateUser.setDate(dateNow.getDate() + day)
                data.specialUser = spcialDateUser

            }else{
                data.specialUser = new Date(0)
            }   
            data.panel = cart.panel._id
            await user.updateOne({...data})
            await cart.deleteOne()
         
          this.back(req, res)
    })
}

export default new CartController()