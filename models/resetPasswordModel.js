import mongoose from "mongoose"; 

const Schema = mongoose.Schema 
const {ObjectId} = mongoose.Schema 

const resetPasswordSchema = new Schema({
    user:{type: ObjectId, ref:'User', required:true},
    token:{type: String, required:true}
},{timestamps:true})

export default mongoose.model('resetPassword', resetPasswordSchema)