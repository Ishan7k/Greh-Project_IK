const mongoose = require("mongoose"); //mongo db chla dia
const initData = require("./data.js"); // linked with data.js file for data to be stored
const Listing = require("../models/listing.js"); // linked with listing file

const MONGO_URL = "mongodb://127.0.0.1:27017/Greh"; // db name is greh and making it url available 
// base connection establisment for mongodb
main()
    .then(() => {
        console.log("connected to DB"); //database connected
    })
    .catch(err => {
        console.log(err); //error aae to
    });

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("connected to DB");
    await initDB();   // call here after connection
}
main().catch(err => console.log(err));


const initDB = async () => {
    await Listing.deleteMany({}); // pehle se agr faltu pada hai to hta do
    await Listing.insertMany(initData.data); // data.js wala data daal dia ab....using obj .data!!!!
    console.log("data was initialized");
};

initDB(); //fn is called