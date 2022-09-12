const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/user')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
const FacebookTokenStrategy = require('passport-facebook-token')

// using .env rather than config.js:
require('dotenv').config()

exports.FacebookPassport = passport.use(
  new FacebookTokenStrategy(
    {
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({facebookId: profile.id}, (err, user) => {
        if (err) return done(err, false)
        if (!err && user) return done(null, user)
        user = new User({ username: profile.displayName })
        user.facebookId = profile.id
        user.firstname = profile.name.givenName
        user.lastname = profile.name.familyName
        user.save((err, user) => {
          if (err) return done(err, false)
          return done(null, user)
        })
      })
    }
  )
)

exports.local = passport.use(new LocalStrategy(User.authenticate()))
// Passport session based authentication requires serialize
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

exports.getToken = user => {
  return jwt.sign(user, process.env.SEC_KEY, {expiresIn: 3600})
  // 3600 = one hour
}

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.SEC_KEY

exports.jwtPassport = passport.use(
  new JwtStrategy(
    opts,
    (jwt_payload, done) => {
      console.log('JWT payload:', jwt_payload)
      User.findOne({_id: jwt_payload._id}, (err, user) => {
        if(err) {
          return done(err, false)
        } else if (user) {
          return done(null, user)
        } else {
          return done(null, false)
          // insert code here to prompt to create new user
        }
      })
    }
  )
)

exports.verifyUser = passport.authenticate('jwt', {session: false})

exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin) return next()
  const err = new Error("You are not authorized")
  res.status = 403
  return next(err)
}