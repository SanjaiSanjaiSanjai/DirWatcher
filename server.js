const express = require('express');
const fs = require('fs');
const cron = require('node-cron');
const connectToMongoDB = require('./utils/db.config');
const cors = require("cors")
const morgan = require("morgan")
require('dotenv').config({ path: '.env' });
const route = require("./router/index")

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json())
app.use(cors({
    origin: "*",
    optionsSuccessStatus: 200,
    allowedHeaders: "*",
}))
app.use(morgan("dev"))
app.use(route)


// connecting mongoDB
connectToMongoDB()

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
