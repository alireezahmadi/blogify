import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import flash from 'connect-flash'
import bodyParser from 'body-parser'
import session from 'express-session'
import expressLayouts from 'express-ejs-layouts'
import MongoStore from 'connect-mongo'
import { fileURLToPath } from 'url'
import path from 'path'
import passport from 'passport'
import 'dotenv/config'

process.on('uncaughtException', (err) => {
  console.log('UNCAUGTH EXCEPTION 🫣🫣')

  console.log(err.name, err.message)
  process.exit(1)
})

import connectDB from './config/dbConfig.js'
import passwordLocalStrategy from './password/password-local.js'
import passwordGoogleStrategy from './password/password-google.js'
//import parsistLogin from './middleware/parsistsLogin.js'
import PanelRoutes from './routes/panelRoutes.js'
import IndexRoutes from './routes/indexRoutes.js'
import AppError from './utils/AppError.js'
import globalErrorHandler from './controllers/erros/errorController.js'

const app = express()
connectDB()

const __dirname = path.join(fileURLToPath(import.meta.url))

passwordLocalStrategy()
passwordGoogleStrategy()

app.use(express.static(path.join(__dirname, '..', 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '..', 'views'))
app.use(expressLayouts)
app.set('layout', 'master')
app.set("layout extractScripts", true)
app.set('layout extractStyles', true)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { secure: false }
}))
app.use(express.json())
app.use(cookieParser('secret'))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
// app.use(parsistLogin)
app.use((req, _res, next) => {
  app.locals = {
    auth: {
      check: req.isAuthenticated(),
      user: req.user,
      roles: req.user ? Object.values(req.user?.roles).filter(Boolean) : null
    },
    url: req.url
  }
  next()
})


app.use('/', IndexRoutes)
app.use('/panel', PanelRoutes)
app.get('/notFound', (req, res) => {

  res.render('errorsHandler/index', { data: req.query })
})

app.all('/*', (req, _res, next) => {
  next(new AppError(`صفحه "${req.originalUrl}" وجود ندارد`, 404))
})
app.use(globalErrorHandler)
const PORT = process.env.PORT || 3500

mongoose.connection.once('open', () => {
  console.clear()
  console.log('MogoBD was Successfully Connected 🥰🥰')
  const server = app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
  })
  process.on('unhandledRejection', (err) => {
    console.log('UNHANDLEED REJECTION 😮😮 shutting down!!')
    console.log(err)
    console.log(err.name, err.message)
    server.close(() => {
      process.exit(1)
    })
  })
})