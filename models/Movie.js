const mongoose = require("mongoose")

const MovieSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            min: 1,
            max: 128,
        },
        description: {
            type: String,
            required: true,
            min: 1,
            max: 2048,
        },
        release_date: {
            type: Date,
            required: true,
        },
        rating: {
            type: Number,
            required: false,
            min: 0,
            max: 5,
        },
        categoryId: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: false,
        },
    }, { timestamps: true } // Pour ajouter des champs 'createdAt' et 'updatedAt' mis à jour automatiquement par Mongo
);

module.exports = mongoose.model("Movie", MovieSchema);