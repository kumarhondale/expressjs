const httpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Place = require('../models/place');
const mongoose = require('mongoose');
const User = require('../models/user');


const getPlaceById = async (req,res,next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch(err){
   const error = new httpError('Something went wrong, Could not fine place id ',500);
    return next(error);
  }

  if(!place){
    const error = new httpError("Could't find the place for the provieded id",404);
    return next(error);
  }
  res.json({place: place.toObject({getters:true})});
};

const createPlace = async (req,res,next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new httpError('Invalida input passed, please check your data',422);
    return next(error);
  }
  const { title,description,address,location,creator} = req.body;
  const createdPlace = new Place({
    title,
    description,
    address,
    location,
    creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err){
    const error = new httpError('Could not find the user for provided id.',500);
    return next(error);
  }

  if(!user){
    const error = new httpError('Could not find the user for provided id', 404);
    return next(error);
  }

  try{
        const session = await mongoose.startSession();

        await session.withTransaction(async () => {

          await createdPlace.save();

          user.places.push(createdPlace);

          await user.save();

        });

        session.endSession();
  } catch(err){
    console.log(err);
    const error = new httpError('Creating place failed, please try again',500);
    return next(error);
  }
  res.status(201).json(createdPlace);
}

const getPlaceByUserId = async (req,res,next) => {
  const userId = req.params.uid;
  
  // let places;
  let userWithPlaces;
  try{
    userWithPlaces = await User.findById(userId).populate('places');
  } catch(err){
    const  error  = new httpError('Fetching places failed, Please try again later',500);
    return next(error);
  }

  if(!userWithPlaces || userWithPlaces.places.lenght === 0){
    return next(
      new httpError('Could not find the places for the provided user id',404)
    );
  }

  res.json({ places : userWithPlaces.places.map(place => place.toObject({ getters: true})) });
}

const updatePlace = async (req,res,next) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    throw new httpError('Invalida input passed, please check your data',422);
  }
  const {title,description} = req.body;
  const placeId = req.params.pid;
  let place;
  try{
    place = await Place.findById(placeId);
  }catch(err){
    const error = new httpError('Something went wrong , could not update place', 500);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try{
    await place.save();
  }catch(err){
    const error = new httpError('Something went wrong, could not update place',500);
    return next(error);
  }
  res.status(200).json({place: place.toObject({ getters : true})});

}

const deletePlace = async (req,res,next) => {
  const placeId = req.params.pid;
  let place;
  try{
    place = await Place.findById(placeId).populate('creator');
  }catch(err){
    const error = new httpError('Something went wrong , could not delete place', 500);
    return next(error);
  }

  if(!place){
    const error = new httpError('Could not find the palce for this id', 404);
    return next(error);
  }

  try{
    //await Place.remove();

        const session = await mongoose.startSession();

        await session.withTransaction(async () => {

          await place.remove();
          place.creator.places.pull(place);
          await place.creator.save();

        });

        session.endSession();

  } catch(err){
    const error = new httpError('Something went wrong , could not delete place', 500);
    return next(error);
  }
  
  res.status(200).json({message : "Place deleted !"});
}

exports.getPlaceById = getPlaceById;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.getPlaceByUserId = getPlaceByUserId;