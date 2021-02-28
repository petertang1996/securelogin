//jshint esversion:6

require('dotenv').config();
const express = require("express");
const app = express();
app.use(express.static("public"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

const ejs = require("ejs");
app.set('view engine', 'ejs');

const encrypt = require("mongoose-encryption");


const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/secureData");

const loginSchema = new mongoose.Schema({
	email: String,
	password: String
});

loginSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});


const loginModel = mongoose.model("Login", loginSchema);


app.get("/", function(req,res){
	res.render("home");
})


app.route("/login")
	.get(function(req,res){
		res.render("login",{loginMessage:" "});
	})
	.post(function(req,res){
		const username = req.body.username;
		const password = req.body.password;
		loginModel.findOne({email: username}, function(err, foundUser){
			if (err){
				console.log(err);
			} else {
				if(foundUser){
					if(foundUser.password === password){
						res.render("secrets");
					} else {
						res.render("login", {loginMessage: "Incorrect Password. Please Try Again."});
					}
				}
				res.render("login", {loginMessage: "Can't find this user.  Try again."})	
			}
		})
	})


app.route("/register")
	.get(function(req,res){
		res.render("register");
	})
	.post(function(req,res){
		const username = req.body.username;
		const password = req.body.password;
		const newLogin = new loginModel({
			email: username,
			password: password
		})

		newLogin.save(function(err){
			if (!err){
				res.render("secrets");
			}
		})
	});






app.listen(3000, function(){
	console.log("Server running on port 3000.")
})