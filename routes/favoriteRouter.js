const express = require('express')
const Favorite = require('../models/favorite')
const authenticate = require('../authenticate')
const cors = require('./cors')

const favoriteRouter = express.Router()

////////////////////////////////////////////////////////////////////////////
// FAVORITE CRUD OPERATIONS
////////////////////////////////////////////////////////////////////////////
favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
  Favorite.find({ user: req.user._id })
  .populate('user')
  .populate('campsites')
  .then(favorites => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(favorites)
  })
  .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  Favorite.findOne({ user: req.user._id })
  .then(favorites => {
    if (favorites) {
      req.body.forEach(favorite => {
        if (!favorites.campsites.includes(favorite)) favorites.campsites.push(favorite)
      })
      favorites.save()
      .then(favorites => {
        console.log('favorites updated', favorites)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorites)
      })
      .catch(err => next(err))
    } else {
      // favorites doesn't exist, create it
      // req.body is array of objects with campsite id, map to get id out of objects
      Favorite.create({ user: req.user._id, campsites: req.body.map(campsite => campsite._id) })
      .then(favorites => {
        console.log('favorites created', favorites)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorites)
      })
      .catch(err => next(err))
    }
  })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /favorites')
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOneAndDelete({ user: req.user._id})
  .then(favorites => {
    if (favorites) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorites)      
    } else {
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')
      res.end('No favorites to delete')      
    }
  })
  .catch(err => next(err))
})

////////////////////////////////////////////////////////////////////////////
// FAVORITE's CAMPSITE ID CRUD OPERATIONS
////////////////////////////////////////////////////////////////////////////
favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end(`GET ID operation not supported on favorites/${req.params.campsiteId}`)
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  Favorite.findOne({ user: req.user._id })
  .then(favorites => {
    if (favorites) {
      if (!favorites.campsites.includes(req.params.campsiteId)) {
        favorites.campsites.push(req.params.campsiteId)
        favorites.save()
        .then(favorites => {
          console.log('favorites updated', favorites)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(favorites)
        })
        .catch(err => next(err))
      } else {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        res.end('favorite already exists')      
      }
    } else {
      // favorites doesn't exist, create it
      Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
      .then(favorites => {
        console.log('favorites with one item created', favorites)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorites)
      })
      .catch(err => next(err))
    }
  })
  .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  res.statusCode = 403
  res.end(`PUT ID operation not supported on favorites/${req.params.campsiteId}`)
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne({ user: req.user._id})
  .then(favorites => {
    if (favorites) {
      favorites.campsites = favorites.campsites.filter(campsite => campsite.toString() !== req.params.campsiteId)
      favorites.save()
      .then(favorites => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorites)      
      })
      .catch(err => next(err))
    } else {
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')
      res.end('No favorites to delete')      
    }
  })
  .catch(err => next(err))
})

// export default favoriteRouter
module.exports = favoriteRouter