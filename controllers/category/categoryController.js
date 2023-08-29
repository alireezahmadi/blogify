import CategoryModel from "../../models/categoryModel.js";
import autoBind from "auto-bind";
import catchFunction from '../../utils/catchFunction.js'

class CategoryController {
    constructor() {
        autoBind(this)
    }

    back(req, res) {
        res.redirect(req.header('Referer'))
    }

    getAll = catchFunction(async (req, res, next)=>{
        const pageNum = req.query['pageNum'] || 1
            const pageLimit = req.query['pageLimit'] || 3 
            const options = {
                page: pageNum, 
                limit: pageLimit
            }

            const categoryModelAggregate = CategoryModel.aggregate([
                
                {
                   
                    $lookup:{
                        from:'categories',
                        localField:'parent' , 
                        foreignField:'_id', 
                        as:'parent', 
                        pipeline:[
                            {
                                $project:{
                                    title: 1, 
                                    slug:1
                                }
                            }
                    ]


                    }
                },
                {
                    $sort:{createdAt:-1}
                }
            ]) 
            const categories = await CategoryModel.aggregatePaginate(
                categoryModelAggregate, 
                options
            )
            //res.json(categories)
            res.render('pannel/category/index', {categories})
    })

    create = catchFunction(async (req, res, next)=> {
        if(req.method == 'GET'){
            const categories = await CategoryModel.find({valid:true}).populate([
                {
                    path:'parent', 
                    select:'title _id'
                }
            ])
          
            const errorsMsg = req.flash('errors')
            const successMsg = req.flash('suucess')
           res.render('pannel/category/create', {categories, errorsMsg, successMsg})
        }
        if (req.method == 'POST') {
            let { title, parent, valid = false } = req.body
              
            if (parent) {
                const category = await CategoryModel.findById(parent)
                if (category) parent = category._id
            }else{
                parent = null
            }
           
            if (valid === 'on') {
                valid = true
            }
         
            const newCategory =  await new CategoryModel({
                title,
                parent,
                valid,
                slug: title
            })
            newCategory.slug = await newCategory.uniqueSlug() 
            newCategory.save()
            req.flash('suucess', `"${title}" با موفقیت ثبت شد`)
            return this.back(req, res)
        }

    })

    update = catchFunction(async (req, res, next)=>{
        if(req.method == 'GET'){
            const slug = req.params['slug']
            const categories = await CategoryModel.find({valid:true})
            const category = await CategoryModel.findOne({slug}).populate([
                {
                    path:'parent', 
                    select:'title _id'
                }
            ])
            if(!category){
                return this.back(req, res)
            }
            const successMsg = req.flash('success')
            const errorsMsg = req.flash('errors') 
            res.render('pannel/category/edite', {categories, category, successMsg, errorsMsg})
        }
        if(req.method == 'POST'){
            const body = req.body
            const slug = req.params['slug']
            const category = await CategoryModel.findOne({slug})
            if(!category){
                return this.back(req, res)
            }
            if(body.parent){
                const parent = await CategoryModel.findById(body.parent)
                if(parent) body.parent = parent._id
            }else{
                body.parent = null
            }
            if(body.valid == 'on'){
                body.valid = true
            }else{
                body.valid = false
            }
            await category.updateOne(body)
            res.redirect('/panel/categories')

        }
    })

    delete = catchFunction(async (req, res, next)=>{
        const slug = req.params['slug']
        const category = await CategoryModel.findOne({slug})
        if(!category){
            return this.back(req, res)
        } 
        if(!category.parent){ 
            const categories = await CategoryModel.find({parent: category._id}) 
            if(categories.length){
                for(let cat of categories){
                    await cat.deleteOne()
                }
                
            }
        }

        await category.deleteOne() 
        return this.back(req, res)
    })
}


export default new CategoryController()