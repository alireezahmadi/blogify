import { body } from 'express-validator'
import path from 'path'
import CategoryModel from '../models/categoryModel.js'

const blogValidators = () => {
    return [
        body('title')
            .not()
            .isEmpty()
            .withMessage('عنوان کورس نباید خالی باشد')
            .isLength({ min: 8 })
            .withMessage("حداکثر تعداد کارکتر عنوان باید۸ باشد"),
        body('description')
            .not()
            .isEmpty()
            .withMessage('توضیحات کورس نباید خالی باشد')
            .isLength({ min: 8 })
            .withMessage("حداکثر تعداد کارکتر توضیحات باید۸ باشد"),

        body('categories')
            .custom(async(value)=> {
            
                let errors = []
                if(!Array.isArray(value)){
                    value = [value]
                }
                if(value.length){
                    for(let id of value){
                        const category = await CategoryModel.findById(id) 
                        if(!category){
                            errors.push(`${id} دسته بندی با این مشخصات یافت نشدی`) 
                        }
                    }
                }
                if(errors.length){
                    throw new Error(errors)
                } 
                
            }),
        body('status')
            .isIn(["puplished", "pending", "unPuplished", "delete"])
            .withMessage('وضعیت دوره مشخص نیست'),

        body('image')
            .custom(async (value, { req }) => {
              
                if (req.url.startsWith('/blogs/update/')) {
                    return
                }
                if (value) {
                    const imageType = ['png', 'jpeg', 'gif', 'jpg']
                    const ExeFile = path.extname(value)
                    const fileType = ExeFile.split('.')[1]
                    if (!imageType.includes(fileType)) {
                        throw new Error('فرمت تصویر صحیح نیست')
                    }

                }
                else{
                    throw new Error('تصویر نباید خالی باشد')
                }
            })


    ]
}

export default blogValidators