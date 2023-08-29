import BlogModel from '../../models/blogModel.js'
import UserModel from '../../models/UserModel.js'
import { validationResult } from 'express-validator'
import UploadController from '../uploadImages/uploadController.js'
import autoBind from 'auto-bind'
import CategoryModel from '../../models/categoryModel.js'
import catchFunction from '../../utils/catchFunction.js'
import AppError from '../../utils/AppError.js'


class BlogController {
    constructor() {
        autoBind(this)
    }
    async validateForm(req){
        const result = await validationResult(req)
        if (!result.isEmpty()) {
            const errors = result.array()
            let messages = []
            errors.forEach(err => messages.push(err.msg))
            req.flash('errors', messages)

            return false
        }

        return true
    }

    back(req, res){
        res.redirect(req.header('Referer') || '/panel')
    }

    getAllBlogs = catchFunction(async(req, res, next) =>{
        const pageNum = parseInt(req.query.pageNum) || 1
        const pageLimit = parseInt(req.query.pageLimit) || 3
        const options = {
            page: pageNum,
            limit: pageLimit,
            sort: {
                createAt: -1
            }
        }

        const blogsModelAggregat = BlogModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                    pipeline: [
                        {
                            $project: {
                                username: 1, 
                               
                            }
                        }
                    ]
                },
               
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categories',
                    foreignField: '_id',
                    as: 'categories',
                    pipeline: [
                        {
                            $project: {
                                title: 1,
                                id: 1 
                               
                            }
                        }
                    ]
                },
               
            },
          
        
        ])
        const blogs = await BlogModel.aggregatePaginate(
            blogsModelAggregat,
            options,

        )
        //res.json(blogs)
        res.render('pannel/blog/index', { blogs })
    })

    getAll = catchFunction(async(req, res, next) =>{
        const pageNum = parseInt(req.query.pageNum) || 1
        const pageLimit = parseInt(req.query.pageLimit) || 3
        const options = {
            page: pageNum,
            limit: pageLimit,
            sort: {
                createAt: -1
            }
        }

        const blogsModelAggregat = BlogModel.aggregate()
        const blogs = await BlogModel.aggregatePaginate(
            blogsModelAggregat,
            options,

        )
        //res.json(blogs)
        res.render('blog/list', { blogs, title:'مقالات' })
    })

    getAuthorBlogs = catchFunction(async(req, res, next) =>{
        const params = req.params['author']
        const user = await UserModel.findOne({username:params})
        const pageNum = parseInt(req.query.pageNum) || 1
        const pageLimit = parseInt(req.query.pageLimit) || 3
        const options = {
            page: pageNum,
            limit: pageLimit,
            sort: {
                createAt: -1
            }
        }

        const blogsModelAggregat = BlogModel.aggregate([
            {
                $match:{
                    author: user._id
                }
            }
        ])
        const blogs = await BlogModel.aggregatePaginate(
            blogsModelAggregat,
            options,

        )
        //res.json(blogs)
        res.render('blog/list', { blogs, title:`لیست مقالات نویسنده : ${params}` })
    })

    getCategoryBlogs = catchFunction(async(req, res, next) =>{
        const slug =  req.params['category'] 
            const category = await CategoryModel.findOne({slug}) 
 
            if(!category){
                
                return next(new AppError('دسته بندی با این نام وجود ندارد', 400))
                
            }
            const pageNum = parseInt(req.query.pageNum) || 1
            const pageLimit = parseInt(req.query.pageLimit) || 3
            const options = {
                page: pageNum,
                limit: pageLimit,
                sort: {
                    createAt: -1
                }
            }

            const blogsModelAggregat = BlogModel
                                        .aggregate()
                                        .match({'categories':category._id})
                                       
            const blogs = await BlogModel.aggregatePaginate(
                blogsModelAggregat,
                options,

            )
            //res.json(blogs)
            res.render('blog/list', { blogs, title:`لیست مقالات بر اساس دسته بندی: ${slug}` })
    })

    get = catchFunction(async(req, res, next)=>{
        const slug = req.params['slug']
        const { ip_address } = req
        const blog = await BlogModel
            .findOne({ slug })
            .populate([
                {
                    path: 'author',
                    select: 'username'
                },
                {
                    path:'categories', 
                    select: 'title id slug'
                },
                {
                    path: 'comments',
                    match:{
                        checked:true
                    },
                    select: 'text parent _id user -blog',
                    populate: [
                        {
                            path: 'user',
                            select: 'username'
                        },
                        {
                            path: 'parent',
                            select: 'text parent _id user'
                        }
                    ]
                }

            ])
            .select('-status -createdAt -updatedAt  -__v')
        
        const categories = blog.categories 
     
        const relatedBlogs = await BlogModel.find({categories:{$in:categories}}).sort({createdAt:-1}).limit(4)
   



        if (!blog.viewCount.find(viewer => viewer == ip_address)) {
            blog.viewCount.push(ip_address)
            blog.save()
        }
     
        //res.json(blog)
        res.render('blog/detail', {blog, relatedBlogs})
    })

    create = catchFunction(async(req, res, next) =>{
        if (req.method === 'GET') {
            const categories = await CategoryModel.find({valid:true}).select('title _id')
            const users = await UserModel.find().select('username')
            const errorsMsg = req.flash('errors')
            const successMsg = req.flash('successMessage')
            res.render('pannel/blog/createBlog', { users: users, categories , errorsMsg, successMsg })
        }
        else if (req.method === 'POST') {
            const { title, description, price, author, isSpecial, status, createAt, categories } = req.body
            const result = await this.validateForm(req)
            if (!result) return this.back(req, res)
          
            const user = await UserModel.findById(author)
            if (!user) {
                req.flash('errors', 'کاربری یافت نشد')
                return this.back(req, res)
            }

            
           
            const filename = req.file.filename.split('.')[0]
            const path = `blogs/${filename}`
            const uploadImage = await UploadController.uploadImages(path, req.file)
            const newCourse = await new BlogModel({
                title,
                slug: title,
                description,
                author: user.id,
                price,
                image: uploadImage.url,
                status,
                categories,
                isSpecial: isSpecial == 'on' ? true : false,
                createAt
            })
            newCourse.slug = await newCourse.uniqueSlugCourse()
            newCourse.save()
            req.flash('successMessage', `دوره "${title}" باموفقیت ثبت شد`)
            return this.back(req, res)
        }
    })

    update = catchFunction(async(req, res, next) =>{
        if (req.method == 'GET') {
            const slug = req.params['slug']
            const categories = await CategoryModel.find({valid:true}).select('title _id')
            const blog = await BlogModel.findOne({ slug })
            const users = await UserModel.find()
            const errorsMsg = req.flash('errors')
            res.render('pannel/blog/updateBlog', { blog, categories ,users, errorsMsg })

        }
        else if (req.method == 'POST') {
            const slug = req.params['slug']
            let body = req.body
            body = body.isSpecial == 'on' ? { ...body, isSpecial: true } : { ...body, isSpecial: false }
            const result = await this.validateForm(req)
            if (!result) return this.back(req, res)
            const blogFound = await BlogModel.findOne({ slug })
            if (!blogFound) {
                req.flash('errors', 'محصولی وجود ندارد')
                return this.back(req, res)
            }
            if (body.image == undefined) {
                delete body.image
            } else {

                const filename = req.file.filename.split('.')[0]
                const path = `blogs/${filename}`
                const uploadImage = await UploadController.uploadImages(path, req.file)
                body = { ...body, image: uploadImage.url }
            }

            await blogFound.updateOne(body)
            return res.redirect('/panel/blogs')
        }
    })

    delete = catchFunction(async(req, res, next) =>{
        const slug = req.params['slug']
        await BlogModel.findOneAndDelete({ slug })
        return this.back(req, res)
    })
}

export default new BlogController()