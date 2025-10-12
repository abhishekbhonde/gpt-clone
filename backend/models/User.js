const mongoose= require("mongoose");


const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        required:true
    },
    openApiKey:{
        type:String,
        required:true
    },
    preferences: {
    theme: { type: String, default: 'dark' },
    model: { type: String, default: 'gpt-3.5-turbo' },
    temperature: { type: Number, default: 0.7 },
    maxTokens: { type: Number, default: 2000 }
  }

},{ timestamps: true })

module.exports = mongoose.model("User", UserSchema)