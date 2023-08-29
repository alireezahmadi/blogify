const fileUploads = (req, res, next) =>{
    if(!req.file) req.body.image = undefined
    else{
        req.body.image = req.file.originalname
    }
    next()
}

export default fileUploads