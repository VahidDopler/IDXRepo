const mongoose = require('mongoose');
const slugify = require('slugify')
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have A name '],
            unique: true,
            trim: true,
        },
        slug: {type: String},
        ratingsAverage: {
            type: Number,
            default: 4.5,
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
        },
        priceDiscount: {
            type: Number,
        },
        summary: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'A tour must have a description'],
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

tourSchema.virtual('durationWeek').get(function () {
    //duration week field
    return Math.round(this.duration / 7);
})

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {lower: true});
    next();
})

// tourSchema.post('save' , function(doc , next) {
//     console.log(doc.name , doc.slug ,doc.price);
//     next();
// })
//pre and post is the process of saving document in db so
//so in post we have doc which saved and in pre we have just access to next
//and this in pre method is doc we want to save in document.

tourSchema.pre('find', function (next) {
    this.find({secretTour : {$ne : true}})
    next()
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
