var mongoose = require('mongoose');
var { DateTime } = require('luxon');

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    postedBy: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    body: {type: String, required: true, maxlength: 140},
    datePosted: {type: Date, required: true},
    post: {type: Schema.Types.ObjectId, ref: 'Blog', required: true}
});

CommentSchema
.virtual('datePosted_formatted')
.get(function() {
    return DateTime.fromJSDate(this.datePosted).toLocaleString(DateTime.DATETIME_MED)
});


module.exports = mongoose.model('Comment', CommentSchema);