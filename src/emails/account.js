const sgMail = require('@sendgrid/mail')
const sendGridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridAPIKey)

const sendWelcomeMail= (email,name)=>{
    sgMail.send({
        to: email,
        from: 'praneet.pratt@gmail.com',
        subject: 'Welcome to Task App!!!',
        text: `Hi ${name}, 
                Thanks for signing up to my App. Will look forward to provide better services. `
    })
}

const sendGoodByeMail= (email,name)=>{
    sgMail.send({
        to: email,
        from: 'praneet.pratt@gmail.com',
        subject: 'Good Bye',
        text: `Hi ${name}, 
                Good Bye, It was pleasure to have you as customer and we are really sorry that you have to leave us.
                
                Kindly provide a feedback on how we could have served you better. We will look forward to serve you again.`
    })
}

module.exports = {
    sendWelcomeMail,
    sendGoodByeMail
}