import IpAddressModel from "../models/ipAddressModel.js";
import requestId  from 'request-ip'
import AppError from "../utils/AppError.js"
const getIpAddress = async (req, _res, next) => {
    try{
        const ip = requestId.getClientIp(req) 
        const ip_address = await IpAddressModel.findOne({ip}) 
        if(ip_address){
            req.ip_address = ip_address.id 
            return next()
        }
            const newIpAdress = await new IpAddressModel({ip}).save() 
            req.ip_address = newIpAdress.id 
            next()
        
    }
    catch(err){
        new AppError(err.message, 400)
    }
}

export default getIpAddress