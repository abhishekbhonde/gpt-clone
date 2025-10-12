const mongoose = require("mongoose")

const messageSchema = new mongoose.model({
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
        required:true
    }
})

module.exports = mongoose.model("Message", messageSchema)