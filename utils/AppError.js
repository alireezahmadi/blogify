class AppError extends Error{
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode 
        this.staus = `${statusCode}`.startsWith('4') ? 'fali':'error' 
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor)
    }
}

export default AppError