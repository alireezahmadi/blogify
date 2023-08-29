import mongoose from "mongoose"; 
import Randomstring from "randomstring";  
import BlogModel from './blogModel.js'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'


const Schema = mongoose.Schema 
const {ObjectId}  = mongoose.Schema 

const BlogSchema = new Schema({
    title:{type: String, text:true, trim:true, required:true},
    description:{type: String, text:true, trim:true, required:true},
    slug:{type: String,text:true, trim:true},
    author:{type: ObjectId, ref:'User', required:true},
    image:{type: String, text:true, trim:true, required:true},
    viewCount : [{
        type:ObjectId, 
        ref:'IpAddress'
    }],
    categories: [{
        type:ObjectId, 
        ref:'Category'
    }],
    status:{
        type: String, 
        enum: ["puplished", "pending", "unPuplished", "delete"],
        default: 'unPuplished'
    }, 
    isSpecial: {type: Boolean, default:false},
    createAt: {type:Date, default:Date.now()} 

},{
    timestamps:true,
    toJSON:{ virtuals:true }
})  



BlogSchema.methods.uniqueSlugCourse = async function(){
    let course = null 
    let slug = this.slug 
    do{
        course = await BlogModel.findOne({slug}) 
        if(course){
            slug += Randomstring.generate(5) 
        }
    }
    while(course)
    slug = slug.replace(/([^۰-۹آ-یa-z0-9]|-)+/g ,'-') 
    return slug
}
BlogSchema.methods.jalaliDate = function(){
    return false
}

BlogSchema.virtual('comments',{
    ref:'Comment',
    localField:'_id',
    foreignField:'blog'
})

BlogSchema.plugin(aggregatePaginate)
export default mongoose.model('Blog', BlogSchema)