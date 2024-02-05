const mongoose = require("mongoose")

const GenreSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            min: 1,
            max: 32,
        },
    }, { timestamps: true }
);

module.exports = mongoose.model("Genre", GenreSchema);