const mongoose = require("mongoose")

const converstationSchema = new mongoose.model({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title:{
        type:String,
        required:true
    },
    model:{
        type:String,
        default:"gpt-3.5-turbo"
    },
    archived:{
        type:Boolean,
        required:true
    }
})

module.exports = mongoose.model("Conversation", converstationSchema)