import mongoose from "mongoose"; 

const Schema = mongoose.Schema 
const {ObjectId} = mongoose.Schema  

const CartShema = new Schema({
    panel : {type:ObjectId, ref:'UpgradePanel'}, 
    user: {type:ObjectId, ref:'User'},
    isPaid: {type:Boolean, default:false}

}, {timestamps:true}) 

export default mongoose.model('Cart', CartShema)