const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth.js')
const Task = require('../models/tasks.js')

router.get('/tasks', auth, async (req,res)=>{
    
    try{
       // const tasks = await Task.find(req.query)
      
       const queryItems = Object.keys(req.query)
       const taskItems = ['description','completed','limit','skip','sortBy']
       const isValidQueryParam = queryItems.every((item) => taskItems.includes(item))
       if(!isValidQueryParam){
         return  res.status(400).send('Error: Invalid Query Param!!!')
       }

       const match = {}
       const sort = {}
       if(req.query.sortBy){
            const sortItems = req.query.sortBy.split('_')
            sort[sortItems[0]] = sortItems[1]=== 'desc'?-1:1
        }
       if(req.query.description){
            match.description = req.query.description
       }
       if(req.query.completed){
           match.completed = req.query.completed === 'true'
       }
       await req.user.populate({
           path: 'tasks',
           match,
           options:{
               limit : parseInt(req.query.limit),
               skip: parseInt(req.query.skip),
               sort
           }
       }).execPopulate()
    //    req.user.tasks =req.user.tasks.filter((task)=>{
    //        if(queryItems[0]){
    //         var task1 = task[queryItems[0]]
    //        }
    //        else{
    //         var task1 = ""
    //        }
    //        if(queryItems[1]){
    //         var task2 = task[queryItems[1]]
    //        }
    //        else{
    //         var task2 = ""
    //        }
    //        var req1 = req.query[queryItems[0]] || ""
    //        var req2 = req.query[queryItems[1]] || ""
    //     return (task1.toString() === req1 && task2.toString() === req2 )
    //  })
      

       
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send(e)
    }
        
    
})

router.get('/tasks/:id',auth, async (req,res)=>{
    try{
        const task = await Task.findOne({_id:req.params.id,ownedBy:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.send(e)
    }
})
router.post('/tasks', auth, async (req,res)=>{
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        ownedBy: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

router.patch('/tasks', auth, async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']

    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
    const queryItems = Object.keys(req.query)
    const isValidQueryParam = queryItems.every((item) => allowedUpdates.includes(item))
    if(!isValidOperation){
        res.status(400).send("Error :Invalid Update Param")
    }

    if(!isValidQueryParam){
        res.status(400).send("Error :Invalid Query Param")
    }
    try{
        await req.user.populate('tasks').execPopulate()
        req.user.tasks =req.user.tasks.filter((task)=>{
            if(queryItems[0]){
             var task1 = task[queryItems[0]]
            }
            else{
             var task1 = ""
            }
            if(queryItems[1]){
             var task2 = task[queryItems[1]]
            }
            else{
             var task2 = ""
            }
            var req1 = req.query[queryItems[0]] || ""
            var req2 = req.query[queryItems[1]] || ""
         return (task1.toString() === req1 && task2.toString() === req2 )
      })
        req.user.tasks.forEach(async (task)=>{
           await Task.updateOne(task,req.body)
           
        })
        res.send(req.user.tasks)
    }catch(e){
        res.status(400).send(e.message)
    }

})

router.patch('/tasks/:id', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']

    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        res.status(400).send('Error: Invalid Update Param!!!')
    }

    try{
        const task = await Task.findOne({_id : req.params.id,ownedBy:req.user._id})
        
        if(!task){
            res.status(404).send()
        }

        updates.forEach((update)=>task[update]=req.body[update])

        await task.save()

    //const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true})
    
    res.send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})
router.delete('/tasks/:id',auth,async (req,res)=>{
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id,ownedBy:req.user._id})
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(400).send(e.message)
    }
})

module.exports = router

