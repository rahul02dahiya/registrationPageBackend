const mongoose = require('mongoose')
const mongoURI = "mongodb://127.0.0.1:27017/intern"

const connectToMongo = () => {
        mongoose.connect(mongoURI)
        .then(()=>{
                console.log("database connected");
        })       
        
}
module.exports = connectToMongo;