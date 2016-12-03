/**
 * Created by angli on 12/2/16.
 */
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var noVar = function(variable) {
    return variable == undefined || variable == "" || variable == null;
};
/**
 * Specifies what strategy we'll use
 */
module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {
            if (!noVar(req.body.name)) {
                User.findOne({'email' : email}, function(err, user) {
                    if ( err ) {
                        return done(err);
                    } else if ( user ) {
                        return done(null, false);
                    } else {
                        var newUser = new User();
                        newUser.email = email;
                        newUser.password = newUser.generateHash(password);
                        newUser.name = req.body.name;
                        newUser.phone = req.body.phone;

                        newUser.save(function(err) {
                            return done(null, newUser);
                        });
                    }

                });
            }

        }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
        },
        function(email, password, done) {
            User.findOne({'email': email}, function(err, user) {
                if ( err ) {
                    return done(err);
                } else if ( !user || !user.validPassword(password) ) {
                    return done(null, false);
                }
                return done(null, user);
            });
        }));
};