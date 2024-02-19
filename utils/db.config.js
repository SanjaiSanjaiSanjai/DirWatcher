const mongoose = require("mongoose");
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.DATABASE_URL || "mongodb://127.0.0.1/dirlog";

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

module.exports = connectToMongoDB;
