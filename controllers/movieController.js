const mongoose = require("mongoose");
const Movie = require("../models/Movie");
const Genre = require("../models/Genre");

// * GET A MOVIE *
module.exports.findOne = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
         // If no movie was found:
         if (!movie) {
            return res.status(404).json({success: false, error: { code: 404, message: "Aucun film correspondant n'a été trouvé."}});
        }
        res.status(200).json({success: true, result: movie});
    } catch (err) {
         // If error is due to bad ID format:
         if (err instanceof mongoose.Error.CastError) {
            return res.status(400).json({success: false, error: { code: 400, message: "L'identifiant saisi est invalide."}});
        }
        // Other server errors:
        return res.status(500).json({success: false, error: { code: 500, message: err}});
    }
}

// * GET ALL MOVIES *
module.exports.findAll = async (req, res) => {
    try {
        // 1️⃣ Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const startIndex = (page - 1) * limit;

        // 2️⃣ Search by keyword
        const keyword = req.query.keyword;
        let query = {};

        if (keyword) {
            query = {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } }
                ]
            };
        }

        // 3️⃣ Search by genre name
        const genreName = req.query.genre;
        if (genreName) {
            const genre = await Genre.findOne({ name: { $regex: genreName, $options: 'i'  }});
            if (genre) {
                query.categoryId = genre._id.toString();
            } else {
                return res.status(404).json({success: false, error: { code: 404, message: "Aucun genre correspondant n'a été trouvé."}});
            }
        }

        const totalMovies = await Movie.countDocuments(query);
        const movies = await Movie.find(query).limit(limit).skip(startIndex);
        res.status(200).json({         
            success: true,
            result: movies,
            total: totalMovies,
            totalPages: Math.ceil(totalMovies / limit),
            currentPage: page,
            limit,
        });
    } catch (err) {
        res.status(404).json({success: false, error: { code: 404, message: err}});
    }
}

// * GET MOVIES BY GENRE *
module.exports.findByGenre = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const movies = await Movie.find({ categoryId: categoryId });

        res.status(200).json({
            success: true,
            result: movies
        });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
}

// * CREATE A MOVIE *
module.exports.create = async (req, res) => {
    const newMovie = new Movie(req.body)
    try {
        const savedMovie = await newMovie.save();
        res.status(201).json({success: true, result: savedMovie});
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(422).json({success: false, error: { code: 422, message: err.message}});
        }
        // For other error types:
        return res.status(500).json({success: false, error: { code: 500, message: err}});
    }   
}

// * UPDATE A MOVIE *
module.exports.update = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if(!movie) {
            return res.status(404).json({success: false, error: { code: 404, message: "Aucun film correspondant n'a été trouvé."}});
        }
        await movie.updateOne({ $set: req.body });
        const updatedMovie = await Movie.findById(req.params.id);
        res.status(200).json({success: true, result: updatedMovie});
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(422).json({success: false, error: { code: 422, message: err.message}});
        }
        return res.status(500).json({success: false, error: { code: 500, message: err}});
    }
}

// * DELETE A MOVIE *
module.exports.delete = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if(!movie) {
            return res.status(404).json({success: false, error: { code: 404, message: "Aucun film correspondant n'a été trouvé."}});
        }
        await movie.deleteOne();
        res.status(204).json({success: true});
    } catch (err) {
        if (err instanceof mongoose.Error.CastError) {
            return res.status(422).json({success: false, error: { code: 422, message: err.message}});
        }
        return res.status(500).json({success: false, error: { code: 500, message: err}});
    }
}

// * UPLOAD AN IMAGE FOR A MOVIE *
module.exports.uploadImage = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({success: false, error: { code: 500, message: "Le film n'a pas pu être trouvé."}});
        }

        movie.image = req.file.path; // Update movie's image's path
        await movie.save();

        res.status(200).json({ success: true, result: movie });
    } catch (err) {
        return res.status(500).json({success: false, error: { code: 500, message: err}});
    }
}
