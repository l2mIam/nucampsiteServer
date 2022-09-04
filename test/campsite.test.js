// process.env.NODE_ENV = 'test';

// let mongoose = require("mongoose");
let Campsite = require("../models/campsite")

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();


chai.use(chaiHttp);

//Our parent block
describe('Campsite', () => {
	beforeEach((done) => { //Before each test we empty the database
		Campsite.remove({}, (err) => { 
		   done();		   
		});		
	});
 /*
  * Test the /GET route
  */
  describe('/GET campsite', () => {
	  it('it should GET all the campsites', (done) => {
			chai.request(server)
		    .get('/campsite')
		    .end((err, res) => {
			  	res.should.have.status(200);
			  	res.body.should.be.a('array');
			  	res.body.length.should.be.eql(0);
		      done();
		    });
	  });
  });

})