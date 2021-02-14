var mongoose = require('mongoose');
var { DateTime } = require('luxon');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: { type: String, required: true, lowercase: true,
        validate: {
            validator: function(value) {
                const User = this;
                return new Promise((resolve, reject) => {
                    User.constructor.findOne({ email: value })
                    .then((userFound) => {
                            if (!userFound){
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }).catch(err => resolve(true));
                    })},
            message: 'Email is already in use.'
    }},
    password: {type: String, required: true},
    firstName: {type: String, required: true, maxlength: 20},
    lastName: {type: String, required: true, maxLength: 20},
    dateCreated: {type: Date, required: true},
    admin: {type: Boolean, default: false}
})

UserSchema
.virtual('dateCreated_formatted')
.get(function() {
    return DateTime.fromJSDate(this.dateCreated).toLocaleString(DateTime.DATETIME_MED)
});

UserSchema
.virtual('full_name')
.get(function(){
    return firstName + ' ' + lastName;
});



module.exports = mongoose.model('User', UserSchema);