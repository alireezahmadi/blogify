import mongoose from "mongoose"; 
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const Schema = mongoose.Schema

const IpAddressSchema = new Schema({
    ip:{ type:String ,required:true}, 

    
},{
timestamps:true, 

}) 
IpAddressSchema.plugin(aggregatePaginate)

export default mongoose.model('IPAddress', IpAddressSchema)
