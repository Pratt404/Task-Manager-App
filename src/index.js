const express = require('express')
require('./db/mongoose.js')
const userRouter = require('./router/user.js')
const taskRouter = require('./router/task.js')

const app = express()

const port = process.env.PORT

// app.use((req,res)=>{
//     res.status(503).send('Under Maintainence')
// })

//Customize to parse json to object for each request
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log("Server is up and running on port :",port)
})


//USer Task RelationShiP

// const Task = require('./models/tasks.js')
// const User = require('./models/users.js')

// myfunc= async function(){
//     // const task = await Task.findById('5f4d0cec0481a14ed8537a84')
//     // await task.populate('ownedBy').execPopulate()
//     // console.log(task.ownedBy)
//     const user = await User.findById('5f4d0ce00481a14ed8537a82')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// myfunc()