const mongoose = require('mongoose')
const validator = require('validator')
mongoose.connect(process.env.MONGODB_URL,
{
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    autoIndex:true,
    useCreateIndex:true
})




// const me = new User({
//     name:  '   Pratt   ',
//     email: '  PRANeet.pratt@gmail.com    ',
//     age : 25,
//     password: '404Pass404Word'
// })

// const myTask = new Task({
//     description: 'Partying till the night     ',
//    completed: true
// })

// me.save().then(()=>{
//     console.log(me)
// }).catch((error)=>{
//     console.log(error)
// })

// myTask.save().then(()=>{
//     console.log(myTask)
// }).catch((error)=>{
//     console.log(error)
// })
