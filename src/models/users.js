const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./tasks.js')
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        index:true,
        unique:true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Enter Valid Email')
            }
        }

    },
    password:{
        type: String,
        required : true,
        minlength: 6,
        trim: true,
        validate(value){
            if(value.toUpperCase().includes('PASSWORD')){
                throw new Error('Complexity not met.')
            }
        }

        
    },
    age: {
        type: Number,
        default: 25,
        validate(value){
            if(value<0){
                throw new Error('Positve Integer only.')
            }
        }
    },
    tokens : [{
        token:{
            type:String,
            required: true
        }
    }],
    avatar:{
        type: Buffer
    }
},{
    timestamps:true
})
userSchema.virtual('tasks',{
    ref:'Task',
    localField: '_id',
    foreignField: 'ownedBy'
})


userSchema.methods.toJSON = function(){
    const user = this.toObject()
    delete user.password
    delete user.tokens
    delete user.avatar
    delete user.__v
    return user
}
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},'IamPratt')
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token

}
userSchema.statics.findUserByCredentials = async (email,password)=>{
   
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to Login')

    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
        throw new Error('Unable to Login')
    }

    return user
    


}

userSchema.pre('save', async function(next){
    const user = this
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({ownedBy : user._id})

    next()
})
const User = mongoose.model('User', userSchema)

User.createIndexes()

module.exports = User