import cloudinary from 'cloudinary';
import autoBind from 'auto-bind';
import fs from 'fs'

class UploadController {
    constructor() {
        autoBind(this)
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME_CLOUDINARY,
            api_key: process.env.API_KEY_CLOUDINARY,
            api_secret:process.env.API_SECRET_CLOUDINARY
        });
    }

    async uploadImages(path, file){
        if(!path) throw new Error('نام فایل انتخاب نشده است') 
        const url = await this.#uploadToCloudinary(path, file) 
        this.#removeTemp(file.path)
        return url
        
    }

    #uploadToCloudinary(path, file){
        return new Promise((resolve, reject)=>{
            cloudinary.v2.uploader.upload(
                file.path, 
                {
                    folder:path
                }, 
                (err, res) => {
                    if(err){
                        this.#removeTemp(file.path) 
                      console.log(' error for handel uoload image to cludinary\n', err )
                      return reject(err)
                    }
                    resolve({
                        url:res.secure_url
                    })
                }
            )
        })
    }

    #removeTemp(path){
        fs.unlink(path, (err)=> console.log(err))
    }
}

export default new UploadController()