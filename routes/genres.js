const Genre = require("../models/Genre");
const router = require("express").Router();
const genreController = require("../controllers/genreController");
const movieController = require("../controllers/movieController");

router.get("/:id/movies", movieController.findByGenre); // GET MOVIES BY GENRE
router.get("/:id", genreController.findOne);            // GET A GENRE
router.get("/", genreController.findAll);               // GET ALL GENRES

module.exports = router