// import express from 'express'
const express = require('express')
const Campsite = require('../models/campsite')
const authenticate = require('../authenticate')

const campsiteRouter = express.Router()

////////////////////////////////////////////////////////////////////////////
// CAMPSITE CRUD OPERATIONS
////////////////////////////////////////////////////////////////////////////
campsiteRouter.route('/')
// .all((req, res, next) => {
//     res.statusCode = 200
//     res.setHeader('Content-Type', 'text/plain')
//     next()
// })
.get((req, res, next) => {
    Campsite.find()
    .populate('comments.author')
    .then(campsites => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(campsites)
    })
    // pass error to overall error handler, express will deal with it
    .catch(err => next(err))
    // res.end('Will send all the campsites to you')
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // create entry from body of request. Mongoose will check schema, return promise

    Campsite.create(req.body)
    .then(campsite => {
      console.log('Campsite Created ', campsite)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(campsite)
    })
    .catch(err => next(err))
})
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /campsites')
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // obviously this is a big NO NO, just doing for demo
    Campsite.deleteMany()
    .then(response => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(response)      
    })
    .catch(err => next(err))
})

////////////////////////////////////////////////////////////////////////////
// CAMPSITE ID CRUD OPERATIONS
////////////////////////////////////////////////////////////////////////////
campsiteRouter.route('/:campsiteId')
.get((req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .populate('comments.author')
  .then(campsite => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(campsite)
  })
  .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res) => {
  res.statusCode = 403
  res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`)
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  // params: campsiteId, $set (update operator), object to get updated info from updated document
  Campsite.findByIdAndUpdate(req.params.campsiteId, {
    $set: req.body
  }, { new: true })
  .then(campsite => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(campsite)
  })
  .catch(err => next(err))
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.findByIdAndDelete(req.params.campsiteId)
  .then(respond => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(respond)
  })
  .catch(err => next(err))
})

////////////////////////////////////////////////////////////////////////////
// CAMPSITE COMMENTS CRUD OPERATIONS
////////////////////////////////////////////////////////////////////////////
campsiteRouter.route('/:campsiteId/comments')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
      // specific campsite may not exist, check for null value
      if (campsite) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(campsite.comments)
      } else {
        err = new Error(`Campsite ${req.params.campsiteId} not found`)
        err.status =404
        return next(err)
      }
    })
    .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
      if (campsite) {
        req.body.author = req.user._id
        campsite.comments.push(req.body)
        campsite.save()
        .then(campsite => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(campsite.comments)
        })
        .catch(err => next(err))
      } else {
        err = new Error(`Campsite ${req.params.campsiteId} not found`)
        res.status = 404
        return next(err)
      }
    })
    .catch(err => next(err))
})
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`)
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // obviously this is a big NO NO, just doing for demo
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
      if (campsite) {
        for (let i = (campsite.comments.length - 1); i >= 0; i--) {
          campsite.comments.id(campsite.comments[i]._id).remove()
        }
        campsite.save()
        .then(campsite => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(campsite.comments)
        })
        .catch(err => next(err))
      } else {
        err = new Error(`Campsite ${req.params.campsiteId} not found`)
        res.status = 404
        return next(err)
      }
    })
    .catch(err => next(err))
})

////////////////////////////////////////////////////////////////////////////
// CAMPSITE COMMENTS SPECIFIC ID CRUD OPERATIONS
////////////////////////////////////////////////////////////////////////////
campsiteRouter.route('/:campsiteId/comments/:commentId')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
      // specific campsite may not exist, check for null value
      if (campsite && campsite.comments.id(req.params.commentId)) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(campsite.comments.id(req.params.commentId))
      } else if (!campsite) {
        // campsite null
        err = new Error(`Campsite ${req.params.campsiteId} not found`)
        err.status =404
        return next(err)
      } else {
        // campsite exits but comment doesn't
        err = new Error(`Comment ${req.params.commentId} not found`)
        err.status =404
        return next(err)
      }
    })
    .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res) => {
          res.statusCode = 403
          res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`)
})
.put(authenticate.verifyUser, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .then(campsite => {
    // check if values exist before updating
    if (campsite && campsite.comments.id(req.params.commentId)) {
    // check if user matches the comment author
      if ((campsite.comments.id(req.params.commentId)).author._id.equals(req.user._id)) {
        if (req.body.rating) {
          campsite.comments.id(req.params.commentId).rating = req.body.rating 
        }
        if (req.body.text) {
          campsite.comments.id(req.params.commentId).text = req.body.text
        }
        campsite.save()
        .then(campsite => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(campsite)
        })
        .catch(err => next(err))
      } else {
        err = new Error("you are not the author")
        err.status = 403
        return next(err)
      }
    } else if (!campsite) {
      err = new Error(`Campsite ${req.params.campsiteId} not found`)
      err.status =404
      return next(err)
    } else {
      err = new Error(`Comment ${req.params.commentId} not found`)
      err.status =404
      return next(err)
    }
  })
  .catch(err => next(err))
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
      if (campsite && campsite.comments.id(req.params.commentId)) {
     // check if user matches the comment author
        if ((campsite.comments.id(req.params.commentId)).author._id.equals(req.user._id)) {
          campsite.comments.id(req.params.commentId).remove()
            campsite.save()
            .then(campsite => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(campsite)
            })
            .catch(err => next(err))
        } else {
          err = new Error("you are not the author")
          err.status = 403
          return next(err)
        }
      } else if (!campsite) {
        err = new Error(`Campsite ${req.params.campsiteId} not found`)
        err.status =404
        return next(err)
      } else {
        err = new Error(`Comment ${req.params.commentId} not found`)
        err.status =404
        return next(err)
      }
    })
    .catch(err => next(err))
})

// export default campsiteRouter
module.exports = campsiteRouter