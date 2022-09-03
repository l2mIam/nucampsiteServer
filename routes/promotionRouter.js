const express = require('express')
const Promotion = require('../models/promotion')

const promotionRouter = express.Router()

promotionRouter.route('/')
.get((req, res, next) => {
  Promotions.find()
  .then(promotions => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(promotions)
  })
  .catch(err => next(err))
})
.post((req, res, next) => {
  Promotions.create(req.body)
  .then(promotions => {
    console.log('Promotion created ', promotion)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(promotions)
  })
  .catch(err => next(err))
})
.put((req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /promotions')
})
.delete((req, res) => {
  Promotion.deleteMany()
  .then(response => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(response)
  })
  .catch(err => next(err))
})

promotionRouter.route('/:promotionId')
.get((req, res, next) => {
  Promotion.findByID(req.params.promotionId)
  .then(promotion => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(promotion)
  })
  .catch(err => next(err))
})
.post((req, res) => {
  res.statusCode = 403
  res.end(`POST operation not supported on /promotions/${req.params.promotionId}`)
})
.put((req, res) => {
  Promotion.findByIdAndUpdate(req.params.promotionId, {
    $set: req.body
  }, { new: true })
  .then(promotion => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(promotion)
  })
  .catch(err => next(err))
})
.delete((req, res) => {
  Promotion.findByIdAndDelete(req.params.promotionId)
  .then(respond => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(respond)
  })
  .catch(err => next(err))
})

// export default promotionRouter
module.exports = promotionRouter