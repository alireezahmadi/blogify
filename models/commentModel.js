import mongoose from "mongoose"; 
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
import moment from "moment-jalaali";
moment.loadPersian({dialect: 'persian-modern',usePersianDigits:true})

const Schema = mongoose.Schema
const {ObjectId} = mongoose.Schema 

const CommentSchema = new Schema({
    blog: {type:ObjectId, ref:'Blog', required:true}, 
    user:{type:ObjectId, ref:'User', required:true}, 
    parent:{type:ObjectId, ref:'Comment', default:null}, 
    text:{type:String, required:true, text:true, trim:true}, 
    checked:{type:Boolean, default:false}, 
    
},{
timestamps:true, 
toJSON:{ virtuals: true }
}) 

CommentSchema.methods.jdate = function(){

   return moment(this.createdAt).fromNow()
}

CommentSchema.plugin(aggregatePaginate) 
CommentSchema.virtual('comments',{
    ref:'Comment', 
    localField:'_id', 
    foreignField:'parent'
})


export default mongoose.model('Comment', CommentSchema)
