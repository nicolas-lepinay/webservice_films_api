const Movie = require("../models/Movie");

const { findSeancesByMovieUid } = require('../services/seances');

const { v4: uuidv4 } = require('uuid');

// * GET A MOVIE *
module.exports.findOne = async (req, res) => {
    try {

        const uid = req.params.uid;
        const movie = await Movie.findOne({ uid: uid}).select('-_id'); // Exclure le champ _id du résultat

         // 404 - No movie found:
         if (!movie) {
            return res.status(404).json({error: { code: 404, message: "Aucun film correspondant n'a été trouvé."}});
        }

        const seances = await findSeancesByMovieUid(movie.uid);
        const hasReservationsAvailable = seances.length > 0;

        const movieWithReservations = { ...movie.toObject(), hasReservationsAvailable };

        // 200
        return res.status(200).json(movieWithReservations);
    } catch (err) {
        // 500 - Server error:
        return res.status(500).json({error: { code: 500, message: `Erreur interne (${err})`}});
    }
}

// * GET ALL MOVIES *
module.exports.findAll = async (req, res) => {
    try {
        // Search by keyword
        const keyword = req.query.query; // ...?query=titanic
        let query = {};

        if (keyword) {
            query = {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } }
                ],
            };
        }

        const movies = await Movie.find(query).select('-_id -__v');

        // 204 - AUCUN FILM
        if (movies.length == 0) return res.status(204).json("Pas de résultat de recherche.");

        const moviesWithReservationsPromises = movies.map(async movie => {
            const seances = await findSeancesByMovieUid(movie.uid);
            const hasReservationsAvailable = seances.length > 0;
            return { ...movie.toObject(), hasReservationsAvailable };
        });

        // Attendre que toutes les promesses soient résolues
        const moviesWithReservations = await Promise.all(moviesWithReservationsPromises);
        
        // 200
        res.status(200).json(moviesWithReservations);
    } catch (err) {
        // 500 - Erreur interner
        res.status(500).json({error: { code: 500, message: `Erreur interne (${err})`}});
    }
}


// * CREATE A MOVIE *
module.exports.create = async (req, res) => {
    try {
        const uid = uuidv4();
        const newMovie = new Movie({ uid, ...req.body });

        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(422).json({error: { code: 422, message: `Le contenu de l'objet film est invalide (${err.message})`}});
        }
        // For other error types:
        return res.status(500).json({error: { code: 500, message: `Erreur interne (${err})`}});
    }   
}

// * UPDATE A MOVIE *
module.exports.update = async (req, res) => {
    const uid = req.params.uid;
    try {
        // Trouver le film par uid et le mettre à jour avec les données reçues dans req.body
        // L'option { new: true } garantit que le document retourné est post-mise à jour
        // .select('-_id') exclut le champ _id du document retourné
        const updatedMovie = await Movie.findOneAndUpdate({ uid: uid }, req.body, { new: true }).select('-_id');
        
        if (!updatedMovie) {
            return res.status(404).json({error: { code: 404, message: "Aucun film correspondant n'a été trouvé."}});
        }
        
        res.status(200).json(updatedMovie);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(422).json({error: { code: 422, message: `Le contenu de l'objet film est invalide (${err.message})`}});
        }
        // Pour d'autres types d'erreurs
        return res.status(500).json({error: { code: 500, message: `Erreur interne (${err})`}});
    }
};


// * DELETE A MOVIE *
module.exports.delete = async (req, res) => {
    try {
        const uid = req.params.uid;
        const movie = await Movie.findOne({ uid: uid });

        if(!movie) {
            return res.status(404).json({error: { code: 404, message: "Aucun film correspondant n'a été trouvé."}});
        }
        await movie.deleteOne();
        res.status(204).json("Le film a été supprimé avec succès.");
    } catch (err) {
        return res.status(500).json({error: { code: 500, message: `Erreur interne (${err})`}});
    }
}

// * UPLOAD AN IMAGE FOR A MOVIE *
module.exports.uploadImage = async (req, res) => {
    try {
        const uid = req.params.uid;
        const movie = await Movie.find({ uid: uid });

        if (!movie) {
            return res.status(404).json({error: { code: 404, message: "Aucun film correspondant n'a été trouvé."}});
        }

        movie.image = req.file.path; // Update movie's image's path
        await movie.save();

        res.status(200).json(movie);
    } catch (err) {
        return res.status(500).json({error: { code: 500, message: `Erreur interne (${err})`}});
    }
}

// * CHECK IF MOVIE HAS AVAILABLE SEANCES *
module.exports.hasAvailableSeances = async (req, res) => {
    try {
        const uid = req.params.uid;
        const movie = await Movie.findOne({ uid: uid });

        if(!movie) {
            return res.status(404).json({error: { code: 404, message: "Aucun film correspondant n'a été trouvé."}});
        }
        await movie.deleteOne();
        res.status(204).json("Le film a été supprimé avec succès.");
    } catch (err) {
        return res.status(500).json({error: { code: 500, message: `Erreur interne (${err})`}});
    }
}
