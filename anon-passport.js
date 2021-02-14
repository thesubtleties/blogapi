const passport = require('passport');

function myAuth (req, res, next) {
    passport.authenticate('jwt', {session: false}, function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { 
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    })(req,res,next);
}

module.exports = myAuth