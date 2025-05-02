// External Module
const express = require("express");
const storeRouter = express.Router();

// Local Module
const storeController = require("../controllers/storeController");
const isauth=require("../middleawre/islogin");


storeRouter.get("/", isauth,storeController.getIndex);
storeRouter.get("/homes",isauth, storeController.getHomes);
storeRouter.get("/bookings",isauth, storeController.getBookings);
storeRouter.get("/favourites",isauth, storeController.getFavouriteList);

storeRouter.get("/homes/:homeId",isauth, storeController.getHomeDetails);
storeRouter.post("/favourites",isauth, storeController.postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId",isauth, storeController.postRemoveFromFavourite);
storeRouter.get("/book/:id",isauth,storeController.showBookingForm)
storeRouter.post("/book/:id",isauth,storeController.handleBooking)

module.exports = storeRouter;