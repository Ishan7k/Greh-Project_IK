//The most powerful schema description language and data validator for JavaScript

const Joi = require("joi"); //joi npm utha li
const review = require("./models/review");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(), //stirng chaliye title me
        description: Joi.string().required, //same
        location: Joi.string().required,
        country: Joi.string().required,
        price: Joi.number().required().min(0), //no chaiye with min 0 req
        image: Joi.string().allow("",null), //image can be without too
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5), 
        comment: Joi.string().required(), 
    }).required(),
});