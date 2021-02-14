const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const nconf = require('nconf');


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    function (email, password, cb) {

        User.findOne({email: email})
            .then(user => {
                if (!user) {
                    return cb(null, false, {msg: 'Incorrect username'});
                } else {
                    bcrypt.compare(password, user.password, (err, res) => {
                        if (res) {
                            return cb(null, user);
                        } else {
                            return cb(null, false, {msg: 'Incorrect password'});
                        }
                    })
                    
                }
            })
            .catch(err => cb(err));
    }
));
nconf.file('config.json');
const secretKey = nconf.get('JWT_SECRET_KEY');
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: secretKey
},
    function (jwtPayload, cb) {
        return User.findById(jwtPayload._id)
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }    
));