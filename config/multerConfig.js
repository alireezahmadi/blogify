import multer from "multer" 
import {mkdirp} from 'mkdirp' 
import fs from 'fs'

const getDir = () => {
    let year = new Date().getFullYear()
    let month = new Date().getMonth()
    let days = new Date().getDay() 
    return `./public/uploads/images/${year}/${month}/${days}`
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
   
        let dir = getDir() 
        mkdirp(dir)
          .then(made => {
            cb(null, dir)
          })
          .catch(err => console.log(err))

           
       
    },
    filename: function (req, file, cb) {
      let filePath = getDir() + '/' + file.originalname 
      if(fs.existsSync(filePath)){
          cb(null, Date.now() + '-' + file.originalname)
      }else{
        cb(null, file.originalname)
      }
    }
  })
  
const upload = multer({ 
  storage: storage,
  limits:{
    fileSize: 1024 * 1024 * 5 
  }

}) 
export default upload