import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const Schema = mongoose.Schema
const {ObjectId} = mongoose.Schema

const userModel = new Schema({
    username: { type: String, trim: true, text: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    roles:{
        User:{type: Number, default:1002}, 
        Admin: Number,
        Admin: Number,
        Author: Number,
    },
    remember_token: { type: String, default: "" },
    specialUser: {type: Date, default:new Date(0)},
    panel: {type:ObjectId, ref:'Cart', default:'64ea11c85553520895b457c6'}
}, { 
    timestamps: true,
    toJSON:{virtuals:true}
})

userModel.virtual('comments', {
    ref:'Comment', 
    localField:'_id', 
    foreignField:'user'
})



userModel.pre('save', async function (next) {
    let user = this
    if (!user.isModified('password')) return next()
    try {
        const salt = await bcrypt.genSalt(12)
        user.password = await bcrypt.hash(user.password, salt)
        return next()

    }
    catch (error) { return next(error) }
})

userModel.methods.isSpecialUser = function(){
    const dateNow = Date.now() 
    const result  =  new Date(this.specialUser) >  dateNow ? true: false
    return result
}


userModel.pre('findOneAndUpdate', async function(next){
    try{
    
      
        const salt = await bcrypt.genSalt(12)
        const hash= await bcrypt.hash(this._update.password, salt)
        this._update.password = hash
      
        next()
    }
    catch(err){
        return next(err)
    }
})

userModel.methods.comparePassword = async function(value) {
    const result = await bcrypt.compare(value, this.password)
    return result
}

userModel.methods.rememberLogin = async function (res) {
    const token = process.env.REMEMBER_TOKEN
    try {
        res.cookie('remember_token',
            token,
            {
                httpOnly: true,
                signed: true,
                maxAge: 1000 * 60 * 60 * 24 * 5
            }
        )
        await this.updateOne({ remember_token: token })
    }
    catch (err) { console.log(err) }

}
userModel.plugin(aggregatePaginate)
export default mongoose.model('User', userModel)