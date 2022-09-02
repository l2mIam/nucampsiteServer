// import express from 'express'
const express = require('express')
const Campsite = require('../models/campsite')

const campsiteRouter = express.Router()

campsiteRouter.route('/')
// .all((req, res, next) => {
//     res.statusCode = 200
//     res.setHeader('Content-Type', 'text/plain')
//     next()
// })
.get((req, res, next) => {
    Campsite.find()
    .then(campsites => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(campsites)
    })
    // pass error to overall error handler, express will deal with it
    .catch(err => next(err))
    // res.end('Will send all the campsites to you')
})
.post((req, res, next) => {
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
.put((req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /campsites')
})
.delete((req, res, next) => {
    // obviously this is a big NO NO, just doing for demo
    Campsite.deleteMany()
    .then(response => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(response)      
    })
    .catch(err => next(err))
})

campsiteRouter.route('/:campsiteId')
.get((req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .then(campsite => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(campsite)
  })
  .catch(err => next(err))
})
.post((req, res) => {
  res.statusCode = 403
  res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`)
})
.put((req, res, next) => {
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
.delete((req, res, next) => {
  Campsite.findByIdAndDelete(req.params.campsiteId)
  .then(respond => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(respond)
  })
  .catch(err => next(err))
})

// export default campsiteRouter
module.exports = campsiteRouter