import BlogModel from "../../models/blogModel.js";
import CategoryModel from '../../models/categoryModel.js'
import catchFunction from '../../utils/catchFunction.js'
const homePage = catchFunction(async(req, res, next) => {
    const newestBlogs = await BlogModel.find({status:'puplished'}).limit(4).sort({createdAt:-1}).select('title image isSpecial viewCount slug')
    let mostComments = await BlogModel.find({status:'puplished'}).populate('comments')
    mostComments = mostComments.filter(item =>item.comments.length > 2)
    const categories = await CategoryModel.find({valid:true}).select('title slug').limit(6)
    res.render('home/index', {newestBlogs, mostComments, categories})
})

export default homePage