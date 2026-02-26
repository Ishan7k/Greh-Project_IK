const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: { //v1
        type: String,
        required: true, // variables bna rhe n this one is req mandatory
        unique: true
    },
    description: String, //v2
    image: {
        filename: {//v3
        type: String,
        default: "listingimage"
    },
    url: {
        type:String,
        default: "https://pixabay.com/photos/sea-onion-nature-sea-squill-bloom-9416402/"
    }
},
    price: Number, //v3
    location: String, //v5
    country: [String], //v6
    reviews: [ //reviews bhi lelo
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
        await Review.deleteMany({_id: { $in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema); //we have created a model Listing
module.exports = Listing; //now we will export the model Listning