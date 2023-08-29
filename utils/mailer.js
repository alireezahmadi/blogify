import nodemailer from 'nodemailer'
import { google } from 'googleapis'

const {
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN,
    OAUTH_lINK,
    EMAIL
} = process.env

const { OAuth2 } = google.auth

const auth = new OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN,
    OAUTH_lINK
)

const sendResetPasswordCode = (email, name, url) => {

    auth.setCredentials({
        refresh_token: GMAIL_REFRESH_TOKEN
    })
    const accessToken = auth.getAccessToken()

    const stmp = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: "OAUTH2",
            user: EMAIL,
            clientId: GMAIL_CLIENT_ID,
            clientSecret: GMAIL_CLIENT_SECRET,
            accessToken,
            refreshToken: GMAIL_REFRESH_TOKEN
        }
    })

    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: "فراموشی گذرواژه",
        html: `
            <div style="direction:rtl;width:500px max-width:780px">
            <h2>بازیابی رمز عبور</h2>
            <h3> سلام "${name}" عزیز 👋👋 </h3>
            <p style="color:#455A64; font-size:1.2rem; background:#FFCDD2; border-radius:10px; padding:10px">
            درخواست شما برای بازنشانی رمز عبور ارسال شد. اگر این درخواست را انجام نداده اید، این ایمیل را نادیده بگیرید. اگر این درخواست را انجام دادید فقط روی  <a href="${url}" style="color:#F44336; text-decoration:none; margin:0 5px;"><strong>لینک</strong></a> کلیک کنید 
            </p>
          </div>
            `
    }

    stmp.sendMail(mailOptions, (err, res) => {
        if (err) return err
        
        return res
    })
    



}

export default sendResetPasswordCode