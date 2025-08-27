const mongoose = require("mongoose");
const mongoPass = process.env.MONGO_PASSWORD ;
const mongoUrl = process.env.MONGO_URL.replace("<password>", mongoPass);

const connectDB = async () => {
    mongoose.connect(mongoUrl,
//         {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }
    )
    .then(()=>{
        console.log("Database connected succesfully!");
        
    }) 
    .catch((error)=>{
        console.log("An error occurred while connected to the database", error);   
        
    })
}



module.exports = connectDB;