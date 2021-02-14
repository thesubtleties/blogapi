var mongoose = require('mongoose');
var { DateTime } = require('luxon');

var Schema = mongoose.Schema;

var BlogSchema = new Schema({
    title: {type: String, required: true, maxlength: 100},
    body: {type: String, required: true, maxlength: 250},
    draft: {type: Boolean, default: true},
    datePosted: {type: Date, required: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment', required: true}],
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

BlogSchema
.virtual('datePosted_formatted')
.get(function() {
    return DateTime.fromJSDate(this.datePosted).toLocaleString(DateTime.DATETIME_MED)
});


module.exports = mongoose.model('Blog', BlogSchema);