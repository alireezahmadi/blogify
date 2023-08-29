import {body} from 'express-validator' 

const upgradePanelValidator = () => {
    return [
        body('title')
        .not()
            .isEmpty()
            .withMessage('عنوان پنل نباید خالی باشد')
            .isLength({ min: 4 })
            .withMessage("حداکثر تعداد کارکتر عنوان باید ۴ باشد"),
        body('description')
            .not()
            .isEmpty()
            .withMessage('توضیحات پنل نباید خالی باشد')
            .isLength({ min: 4 })
            .withMessage("حداکثر تعداد کارکتر توضیحات باید ۴ باشد"),
        
        body('status')
            .isIn(['Basic', 'Advance', 'EnterPrise'])
            .withMessage('وضعیت پنل مشخص نیست'), 
        
 
    ]       

}

export default upgradePanelValidator