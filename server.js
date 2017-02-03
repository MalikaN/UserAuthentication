var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgon = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');

var port  = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database);  // connect to database
app.set('supersecret',config.secret); // secret variable


// use body parser so we can get info from POST and/or URL parameters

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


// use morgan to log requests to the console
app.use(morgon('dev'));

app.get('/setup',function(req,res){

	var nick = new User({

		name: 'Malika',
		password :'malika123',
		admin : true

	});

	nick.save(function(err){

		if(err)
			throw err;
			console.log('User saved ');
			res.json({success : true});
	});


});



	//instance of the router for api routes

	var apiRoutes = express.Router();


// route to authenticate a user (POST http://localhost:8080/api/authenticate)

apiRoutes.post('/authenticate',function(req,res){

	//find user
	User.findOne({

		name : req.body.name},function(err,user){

			if(err) throw err ;

			if(!user){

				res.json({success: false,message:'Authentication Failed.user not found.'});

			}else if(user){

				//check password

				if(user.password != req.body.password){

					res.json({success: false,message:'Authentication Failed.password mismatch.'});
				}
				else
				{

						// if user is found and password is right
        				// create a token

        				var token = jwt.sign(user, app.get('supersecret'),{

        						 expiresIn : 60*60*24 //cannot user expiresInMinutes its invalid
        				});

        				// return the information including token as JSON

        				res.json({
        					success:true,
        					message:'Enjoy Token',
        					token:token

        				});
				}
			}
	});

});


// route middleware to verify a token
apiRoutes.use(function(req,res,next){

	var token =req.body.token || req.query.token || req.headers[''x-access-token'']


	if(token){
			// verifies secret and checks exp
			jwt.verify(token,app.get('supersecret'),function(err,decoded){

					if(err){

						return res.json({success:false,message:'Failed to authenticate token'});
					}else{

						// if everything is good, save to request for use in other routes
						req.decoded = decoded;
						next();
					}

			});

	}else{

		return res.status(403).send({
			success:false,
			message:'No token Provided'

		});
	}
});

	//just a route - GET http://localhost:8080/api/

apiRoutes.get('/',function(req,res){

		res.json({message:'The API we seek'});
	});



// Route to return all Users (GET http://localhost:8080/api/users)

apiRoutes.get('/users',function(req,res){

	User.find({},function(err,users){

		res.json(users);
	});

});

app.get('/',function(req,res){

	res.send('Hello! The API is at http://localhost:' + port + '/api');

});


app.use('/api',apiRoutes);
app.listen(port);
console.log('Magic happens at http://localhost:' + port);






