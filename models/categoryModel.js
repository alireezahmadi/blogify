import mongoose from "mongoose"; 
import AggregatePaginate from 'mongoose-aggregate-paginate-v2'
import Randomstring from "randomstring"; 
import CategoryModel from './categoryModel.js'
const Schema = mongoose.Schema 
const {ObjectId}  = mongoose.Schema

const CategorySchema = new Schema({
    title: {type: String, trim: true, text:true, required:true},
    parent: {type: ObjectId, ref:'Category', default: null}, 
    slug: {type: String, trim: true, text:true}, 
    valid: {type:Boolean, default: false}
},{timestamps:true})

CategorySchema.methods.uniqueSlug = async function(){
    let slug = this.slug  
    let category = null 

    do{
        category = await CategoryModel.findOne({slug})
        if(category) slug += Randomstring.generate(5) 
    }
    while(category) 
    slug = slug.replace(/([^۰-۹آ-یa-z0-9]|-)+/g, '-')
    return slug
}

CategorySchema.plugin(AggregatePaginate)

export default mongoose.model('Category', CategorySchema)