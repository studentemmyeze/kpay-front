console.log
('hello world');
const nodemailer = require ('nodemailer')
const {google} = require ('googleapis')

const CLIENT_ID =
'993188575790-uqan34na3ega55bfm8h7tf7bgf3h983m.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04MvwXi7KJMrzCgYIARAAGAQSNwF-L9IrNnaySWw1aMbmLJRsklWJAN9HOTCTuWNAeE4-W23aqzvwPZY-9DN1fClhDui_sVwu608'
// const CLIENT_ID =
// '1017264334361-h5l5u4aa4kfr07dpmndbt4psa1ndo6vr.apps.googleusercontent.com'
// const CLIENT_SECRET = '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'
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
// const REFRESH_TOKEN = '1//0435HkgYluPsmCgYIARAAGAQSNwF-L9IrypAk5AiSsujC6SZ7EK5YKOp18849-s9yjz4r1JHRnaUFM1aOTySD2abMaLbowZHbxLQ'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN})
exports.sendMail = async function sendMail() {
  try {
    const accessToken = await oAuth2Client.getAccessToken()
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'ca.eze@topfaith.edu.ng',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken


      }
    })

    const mailOptions = {
      from: 'EMMY E <ca.eze@topfaith.edu.ng>',
      to: 'enoima.abraham@topfaith.edu.ng; c.eze@outlook.com',
      subject: 'Sending Emails using API',
      text: 'Hello this is a practise email using API',
      html: '<h1> Hello this is a practise email using API </h1>',
    }

  const result = await transport.sendMail(mailOptions)
  return result
}
  catch (error) {
    return error
  }
}

sendMail().then(result => console.log('Email sent..', result))
.catch
(error=> console.log(error))
