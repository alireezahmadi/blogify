import url from 'url'

const sendErrorDev = (err, res) => {
    let data = {
        status: err.status, 
        statusCode: err.statusCode, 
        message: err.message, 
        stack: err.stack
     
       
    }
    res.redirect(url.format({
        pathname:'/notFound', 
        query:data
    }))
}

const sendErrorProd = (err, res)=>{
    if(err.isOperational){
        let data= {
            status: err.status, 
            statusCode: err.statusCode,
            message: err.message
        }
        res.render('errorsHandler/index', {data})
    }else{
        let data= {
            status: 'error', 
            statusCode: 500,
            message: 'خطایی در سرور رخ داد'
        }
        res.render('errorsHandler/index', {data})
    }
}

const globalErrorHandler = (err, _req, res, _next) => {
    err.statusCode = err.statusCode || 500 
    err.status = err.status || 'error' 
    if(process.env.NODE_ENV?.trim() === 'development'){
        return sendErrorDev(err, res)
    }else if (process.env.NODE_ENV?.trim() === 'production'){
      console.log(' err for production\n', err )
      return sendErrorProd()
    }
}

export default globalErrorHandler