const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); //listing jo manae listing.js me usko bula rhe
const path= require("path"); // for ejs rendering
const methodOverride= require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js"); //- Provides a structured way to send error responses from your Express routes or middleware
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js"); //review ke lie jo manae review.js me usko bula rhe

const MONGO_URL = "mongodb://127.0.0.1:27017/Greh"; // db name is greh and making it url available 

main()
    .then(() => {
        console.log("connected to DB"); //database connected
    })
    .catch(err => {
        console.log(err); //error aae to
    });

async function main() {
    await mongoose.connect(MONGO_URL)
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // view render ho rha
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public"))); //css style ko include kia public folder se

app.get("/", (req,res) => {
    res.send("Hare krishna");
});

//VALIDATION FOR SCHEMA FN USING JOI NPM
const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body); //USED JOI NPM FOR VALIDATION AND SCHEMA LIKE HANDLING OF ERROR
    
    if(error) //jb body ke andar data listing na ho to handle ho jaega
    {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else
    {
        next();
    }
};

//VALIDATION FOR Review SCHEMA FN USING JOI NPM
const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body); //USED JOI NPM FOR VALIDATION AND SCHEMA LIKE HANDLING OF ERROR
    
    if(error) //jb body ke andar data listing na ho to handle ho jaega
    {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else
    {
        next();
    }
};

//index route
app.get("/listings", wrapAsync(async (req, res) => { // /lisitng aane prmkya req res honge
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//show route - iske baad ke saare routes id me search honge
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}));

//create route
app.post("/listings", validateListing, wrapAsync(async (req,res,next) => {
    
    const newListing= new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
);

//edit route
app.get("/listings/:id/edit", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//update route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//Delete route
app.delete("/listings/:id", wrapAsync(async (req,res) => {
    let { id } = req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//Reviews
//Post Review Route -adding review validation middleware
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//delete reviews
app.delete(
    "/listings/:id/reviews/:reviewId",
    wrapAsync(async (req,res) => {
        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);

        // Redirect back to the listing page
        res.redirect(`/listings/${id}`);

    })
);


app.all("/:anything", (req, res, next) => { // local host ke aage jo bhi likha usse handke kr dega....wont result in null..or error
    next(new ExpressError(404, "Page not found!!"));
});

app.use((err, req, res, next) => {
    let {statusCode=500, message="sth went wrong!!"} = err;
    res.status(statusCode).render("error.ejs", {message}); //error page called with the msg
    //res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
}); // port chosen
