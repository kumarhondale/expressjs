const express  = require('express');
const bodyParser = require('body-parser');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const httpError = require('./models/http-error');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

app.use('/api/users',usersRoutes);
app.use('/api/places',placesRoutes);
app.use((req,res,next) => {
  const error = new httpError("Could't find this routs",404);
  throw error;
});

app.use((error,req,res,next) => {
 if(res.headerSent){
  return next(error);
 }
 res.status(error.code || 500)
 res.json({message : error.message || "An unknow error occured !"})
});

mongoose.connect('mongodb://root:root@localhost:27017/mern?&authSource=admin').then( () => {
  app.listen(5000);
}).catch(err => {
  console.log(err);
});