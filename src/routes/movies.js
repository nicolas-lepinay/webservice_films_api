const router = require("express").Router();
const movieController = require("../controllers/movieController");
const myMulter = require("../services/upload");

const { authenticate, ensureAdmin } = require('../middlewares/middleware');

// GET A MOVIE
router.get("/:uid", movieController.findOne);    

// GET ALL MOVIES
router.get("/", movieController.findAll);  

// CREATE A MOVIE
router.post("/", authenticate, ensureAdmin, movieController.create);  

// UPDATE A MOVIE
router.put("/:uid", authenticate, ensureAdmin, movieController.update);   

// DELETE A MOVIE
router.delete("/:uid", authenticate, ensureAdmin, movieController.delete);       

// UPLOAD AN IMAGE FOR A MOVIE
router.post("/:uid/upload", myMulter.upload.single("file"), movieController.uploadImage);  

// CHECK IF MOVIE HAS AVAILABLE SEANCES
router.get("/:uid/seances", movieController.hasAvailableSeances);  

module.exports = router;