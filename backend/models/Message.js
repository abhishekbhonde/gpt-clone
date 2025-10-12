const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation",
        required:true
    },
    role:{
        type:String,
        enum:["user","assistant"],
        required:true
    },
    content:{
        type:String,
        required:true
    },
    token:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model("Message", messageSchema)