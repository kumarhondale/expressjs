const { v4: uuidv4 } = require('uuid');
const httpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/user');


const getUsers = async (req,res,next) => {
  let users;
  try{
    users = await User.find({},'-password');
  }catch(err){
    const error = new httpError('Fetching users failed, please try again later.',500);
    return next(error);
  }
  res.json({users : users.map(user => user.toObject({ getters:true}))});
};

const signup = async (req,res,next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new httpError('Invalid inputs passed, please check your data.', 422);
    return next(error);
  }

  const { name,email,password } = req.body;

  let existingUser;

  try{
    existingUser = await User.findOne({email: email});
  }catch(err){
    const error = new httpError('Signing up failed, please try again later.',500);
    return next(error);
  }

  if(existingUser){
    const error = new httpError('User exists already, please login insted.',500);
    return next(error);
  }
  const creatUser = new User({
      name,
      email,
      image:"test.jpg",
      password,
      places: []
    });

  try {
    await creatUser.save();
  }catch(err){
    const error = new httpError('Signing up failed, please try again.',500);
    return next(error)
  }
  res.status(201).json({user : creatUser.toObject({getters:true})});
};

const login = async (req,res,next) => {
  const {email,password} = req.body;

  let existingUser;

  try{
    existingUser = await User.findOne({email: email});
  }catch(err){
    const error = new httpError('Signing up failed, please try again later.',500);
    return next(error);
  }

  if(!existingUser || existingUser.password !== password){
    const error = new httpError('Logging in failed, please try again later.',500);
    return next(error);
  }
  res.status(200).json({message:"Loged in !"});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;