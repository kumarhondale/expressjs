const express = require('express');
const placesControllers = require('../controllers/places-controller');
const { check } = require('express-validator');
const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);
router.get('/user/:uid',placesControllers.getPlaceByUserId);
router.post('/', [check('title').not().isEmpty(),check('description').isLength({min:5})], placesControllers.createPlace);
router.patch('/:pid',[check('title').not().isEmpty(),check('description').isLength({min:5})], placesControllers.updatePlace);
router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;