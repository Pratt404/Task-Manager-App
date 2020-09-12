const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth.js')
const User = require('../models/users.js')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeMail,sendGoodByeMail} = require('../emails/account.js')


router.post('/users',async (req,res)=>{
    const user = new User(req.body)
    try{
        
        await user.save()
        sendWelcomeMail(user.email,user.name)
        const token = await user.generateAuthToken()
        //Email Authentication pending
        res.status(201).send({user,token})
    }
    catch(err){
        res.status(400).send(err)
    }
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e)=>{
    //     res.status(400).send(e)

    // })
})

router.post('/users/login',async (req,res)=>{
    try{
        const user = await User.findUserByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    }
    catch(e){
        res.status(400).send(e.message)
    }

})


router.post('/users/logout',auth, async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send("User Logged Out Successfully")
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens =[]
        await req.user.save()
        res.send("User Logged Out from everywhere Successfully")
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users/me', auth,async (req,res)=>{
        res.send(req.user)
    // User.find({}).then((users)=>{
    //     res.send(users)
    // }).catch((e)=>{
    //     res.status(500).send(e)
    // })
})

// router.get('/users/:id', async (req,res)=>{
//     try{
//         const user = await User.findById(req.params.id)
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(err){
//         res.status(500).send(err)
//     }

//     // User.findById(req.params.id).then((user)=>{
//     //     console.log("Inside here")
//     //     if(!user){
//     //         return res.status(404).send()
//     //     }
//     //     res.send(user)
//     // }).catch((e)=>{
//     //     res.status(500).send(e)
//     // })
// })

router.patch('/users/me',auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','age','password','email']

    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    
    if(!isValidOperation){
        return res.status(400).send('Error: Invalid Update Param!!!')
    }

    try{
        // const user = await User.findById(req.params.id)

        // if(!user){
        //     res.status(404).send()
        // }

        updates.forEach((update)=> req.user[update]=req.body[update])

        await req.user.save()
         
        //const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true})
        
        res.send(req.user)
        }
    catch(e){
        res.status(400).send(e.message)
    }
})

router.delete('/users/me',auth,async (req,res)=>{
    try{
        // const user = await User.findByIdAndDelete(req.params.id)
        // if(!user){
        //     res.status(404).send()
        // }
        req.user.remove()
        sendGoodByeMail(req.user.email,req.user.name)
        res.send(req.user.name + " Profile Removed Successfully!!!")
    }catch(e){
        res.status(400).send(e)
    }
})

const upload = multer({
    limits : {
        fileSize :200000
    },
    fileFilter(req,file,next){
        if(!file.originalname.match(/.(jpg|png)$/)){
           return next(new Error('Upload file with Extension jpg or png'))
        }
        next(undefined,true)
    }
})

router.post('/users/me/avatar',auth,upload.single('upload'),async (req,res) =>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({"Error" :error.message})
})

router.delete('/users/me/avatar',auth,async (req,res) =>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        
        if(!user || !user.avatar){
           throw Error()
        }
        res.set('Content-Type','image/jpg')
        res.send(user.avatar)
    }catch(e){
        // console.log("In Error", user.avatar)
        res.status(404).send(e.message)
    }
})
module.exports = router