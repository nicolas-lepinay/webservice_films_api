const mongoose = require("mongoose");
const Genre = require("../models/Genre");

// * GET A GENRE *
module.exports.findOne = async (req, res) => {
    try {
        const genre = await Genre.findById(req.params.id);
         // If no genre was found:
         if (!genre) {
            return res.status(404).json({success: false, error: { code: 404, message: "Aucun genre correspondant n'a été trouvé."}});
        }
        res.status(200).json({success: true, result: genre});
    } catch (err) {
         // If error is due to bad ID format:
         if (err instanceof mongoose.Error.CastError) {
            return res.status(400).json({success: false, error: { code: 400, message: "L'identifiant saisi est invalide."}});
        }
        // Other server errors:
        return res.status(500).json({success: false, error: { code: 500, message: err}});
    }
}

// * GET ALL GENRES *
module.exports.findAll = async (req, res) => {
    try {
        const genres = await Genre.find();
        res.status(200).json({         
            success: true,
            result: genres,   
        });
    } catch (err) {
        res.status(404).json(err);
    }
}
