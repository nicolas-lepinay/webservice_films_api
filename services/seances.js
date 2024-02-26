const Seance = require("../models/Seance");

// * GET A MOVIE'S SEANCES (ALL) *
module.exports.findSeancesByMovieUid = async (movieUid) => {   
    try {
        const seances = await Seance.find({ movieUid: movieUid });
        return seances;
    } catch(err) {
        return [];
    }
}