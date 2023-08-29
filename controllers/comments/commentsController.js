import CommentModel from '../../models/commentModel.js'
import BlogModel from '../../models/blogModel.js'
import autoBind from 'auto-bind'
import catchFunction from '../../utils/catchFunction.js'
import AppError from '../../utils/AppError.js'

class CommentController {
    constructor() {
        autoBind(this)
    }
    back(req, res) {
        res.redirect(req.header('Referer') || '/')
    }

    getAll = catchFunction(async(req, res, next)=> {
        const pageNum = parseInt(req.query.pageNum) || 1
        const pageLimit = parseInt(req.query.pageLimit) || 3

        const pageOption = {
            page: pageNum,
            limit: pageLimit
        }

        const commentModeAggregate = CommentModel.aggregate([
          
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        {
                            $project: {
                                username: 1
                            }
                        }
                    ]
                },

            },
            {
                $lookup: {
                    from: 'blogs',
                    localField: 'blog',
                    foreignField: '_id',
                    as: 'blog',
                    pipeline: [
                        {
                            $project: {
                                slug: 1,
                                title: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'parent',
                    foreignField: '_id',
                    as: 'parent',
                    pipeline: [
                        {
                            $project: {
                                text: 1,
                                id: 1
                            }
                        }
                    ]
                }
            },
        ])
        const comments = await CommentModel.aggregatePaginate(
            commentModeAggregate,
            pageOption
        )
        //res.json(comments)
        res.render('pannel/comment/getAll', { comments })
    })

    create = catchFunction(async(req, res, next)=> {
        const { text, parent = null } = req.body

        const slug = req.params['slug']
        const blog = await BlogModel.findOne({ slug })
        if (parent) {
            const replyComment = await CommentModel.findById(parent)
            if (!replyComment) {
                return next(new AppError('کامنتی وجود ندارد', 400))
            }

        }
        if (!blog) {
           
            return next(new AppError('مقاله ای یافت نشد', 400))
        }
        await new CommentModel({
            user: req.user.id,
            blog: blog.id,
            text,
            parent,
            checked: false
        }).save()
        return this.back(req, res)
    })

    update = catchFunction(async(req, res, next)=> {
        if (req.method == 'POST') {
           
            const id = req.params['id']
            let { checked } = req.body
            const comment = await CommentModel.findById(id)
            if (!comment) {
                req.flash('errors', 'کامنتی یافت نشد')
                return this.back(req, res)
            }
            checked = checked === 'on' ? true : false
            await comment.updateOne({ checked })
            res.redirect('/panel/comment/getAll')

        }
    })

    delete = catchFunction(async(req, res, next)=> {
        if (req.method == 'POST') {
            const id = req.params['id']
                const comment = await CommentModel.findById(id).populate('comments')
                if (!comment) {
                    req.flash('errors', 'کامنتی یافت نشد')
                    return this.back(req, res)
                }
            
                if(comment.comments.length){

                    comment.comments.forEach(async (child) => {
                        await child.deleteOne()
                    })
                }
                
                await comment.deleteOne()
                res.redirect('/panel/comment/getAll')

        }
    })
}

export default new CommentController()