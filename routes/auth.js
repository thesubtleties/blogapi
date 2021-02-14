var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
const nconf = require('nconf');
nconf.file('config.json');
const secretKey = nconf.get('JWT_SECRET_KEY');


router.post('/login', function (req, res, next) {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: "Cannot authenticate user."
            })
        } 
        req.login(user, {session: false}, (err) => {
            if (err) {
                res.json({
                    error: err.message
                })
            }
            const token = jwt.sign(user.toJSON(), (process.env.JWT_SECRET_KEY || secretKey));
            return res.json({
                user: {
                    email: user.email,
                    _id: user._id,
                    name: user.firstName + ' ' + user.lastName,
                    admin: user.admin,
                },
                token
            });
        });
    })(req, res);
});

module.exports = router;