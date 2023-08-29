import mongoose from "mongoose"; 

const Schema = mongoose.Schema 

const UpgradePanelShema = new Schema({
    title:{type: String, trim:true, text:true, required:true},
    status:{
        type: String,
        enum:['Basic', 'Advance', 'EnterPrise'],
        required: true,
        default:'Basic'
    }, 
    description:{type: String, trim:true, text:true},
    price: {type:Number, default:0}
    

}, 
{timestamps:true})

export default mongoose.model('UpgradePanel', UpgradePanelShema)