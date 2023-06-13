const mongoose = require('mongoose');
const slugify = require('slugify')
const validit = require('validator')
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have A name '],
            unique: true,
            trim: true,
            // validate : {
            //     validator : function (val) {
            //         return validit.isAlpha(val)
            //     },
            //     message : 'Your tour name must include letter , not anything else!!!'
            // },
            minLength: [10, "A tour must have a equal or more than 10 characters"],
            maxLength: [40, "A tour must have a equal or less than 40 characters"]
        },
        slug: {type: String},
        ratingsAverage: {
            type: Number,
            default: 4.5,
            max: [5.0, "A tour must have less or equal 5 score RatingAverage"],
            min: [1.0, "A tour must have more or equal 0 score RatingAverage"]
        },
        ratingsQuantity: {
            type: Number,
            default: 4.5,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        createAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            trim: true,
            required: [true, 'A tour must have difficulty'],
            enum: {
                values: ['survival', 'medium', 'easy', 'difficult'],
                message: 'A tour must have these property : survival ,medium , easy , difficult'
            }
        },
        priceDiscount: {
            type: Number,
            validate : {
                // This only work for Creating new Document , this.price has access to the doc which we post to the mongoose
                validator :function (val) {
                    return val < this.price;
                },
                message : "Your Discount ({VALUE}) should be equal or less than price!!"
            }
        },
        summary: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'A tour must have a description'],
            maxLength: [40, 'No more than 100 characters']
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image '],
        },
        images: {
            type: [String],
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        }
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }
);

//add some properties for the doc we will send to the client , not in db , so this is virtual which added after the processing
tourSchema.virtual('durationWeek').get(function () {
    //duration week field
    return Math.round(this.duration / 7);
})

//This Document middleware : runs before save() and save()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {lower: true});
    next();
})

// tourSchema.post('save' , function(doc , next) {
//     console.log(doc.name , doc.slug ,doc.price);
//     next();
// })
//pre and post is the process of saving document in db so
// in post we have doc which saved and in pre we have just access to next
//and this in pre method is doc we want to save in document.


//Making comment here
//in find and other find-and... methods when used
//we use pre and post in query object we send into mongodb,
//and we can have specific things we want
//this means query of mongodb
tourSchema.pre(/^find/, function (next) {
    this.find({secretTour: {$ne: true}})
    next()
})

//docs logged after query done in mongodb
tourSchema.post(/^find/, function (docs, next) {
    // docs.forEach(el => {
    //     console.log(el._id);
    // })
    next()
})


tourSchema.post("findOneAndUpdate", function (docs , next){
    next()
})


//aggregation middleware

tourSchema.pre('aggregate', function (next) {
    console.log(this.pipeline())
    this.pipeline().unshift({
        $match: {
            secretTour: {$ne: true}
        }
    })
    next()
})

//if updating specific tour does not work
//because of that secret field was excluded


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
