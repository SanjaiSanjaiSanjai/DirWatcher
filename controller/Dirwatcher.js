const fs = require("fs");
const cron = require("node-cron");
const TaskResults = require("../models/TaskDetails");

let cronJob;
let isTaskRunning = false;
let oldDir = [];

/**
 * perform Background Task and get given string length 
 * @param {string} watchedDirectory 
 * @param {string} magicString 
 * @param {string} initialFiles 
 * @returns {object}
 */

const performBackgroundTask = async (
    watchedDirectory,
    magicString,
    initialFiles
) => {
    const startTime = new Date();
    let files;
    let taskResults = {
        startTime: startTime,
        endTime: null,
        runtime: null,
        filesAdded: [],
        filesDeleted: [],
        defaultfiles: initialFiles,
        magicString: 0,
        status: "in progress",
    };

    try {
        files = await fs.promises.readdir(watchedDirectory);
        for (const file of files) {
            try {
                const filePath = `${watchedDirectory}/${file}`;
                const fileContent = await fs.promises.readFile(filePath, "utf8");
                const occurrences = (
                    fileContent.match(new RegExp(magicString, "g")) || []
                ).length;
                taskResults.magicString += occurrences;
            } catch (err) {
                console.error("Error reading file:", err);
            }
        }

        const filesAfterTask = await fs.promises.readdir(watchedDirectory);

        taskResults.filesAdded = filesAfterTask.filter(
            (file) => !initialFiles.includes(file)
        );

        oldDir.push(
            ...taskResults.filesAdded.filter((file) => !oldDir.includes(file))
        );

        taskResults.filesDeleted = oldDir.filter((file) => !files.includes(file));

        taskResults.endTime = new Date();

        taskResults.runtime = (taskResults.endTime - taskResults.startTime) / 1000;

        return taskResults;
    } catch (err) {
        console.error("Error reading directory:", err);
        taskResults.status = "failed";
        return taskResults;
    }
};

/**
 * Starts a background task based on the provided configuration.
 * @param {string} req.body.watchedDirectory - The directory to watch for changes.
 * @param {string} req.body.magicString - The string to search for in files.
 * @param {string} req.body.interval - The interval at which to run the background task
 */
const startTask = async (req, res) => {
    if (!isTaskRunning) {
        const { watchedDirectory, magicString, interval } = req.body;
        const initialFiles = await fs.promises.readdir(watchedDirectory);

        cronJob = cron.schedule(interval, async () => {
            const taskResults = await performBackgroundTask(
                watchedDirectory,
                magicString,
                initialFiles
            );
            try {
                const newTaskResults = new TaskResults(taskResults);
                await newTaskResults.save();
            } catch (error) {
                console.error("Error saving task results to MongoDB:", error);
            }
        });
        isTaskRunning = true;
        res.status(200).json({ message: "Task started successfully." });
    } else {
        res.status(400).json({ error: "Task is already running." });
    }
};

/**
 * Stops the background task if it is running.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const stopTask = async (req, res) => {
    if (isTaskRunning) {
        cronJob.stop();
        isTaskRunning = false;
        res.status(200).json({ message: "Task stopped successfully." });
    } else {
        res.status(400).json({ error: "No task is running." });
    }
};

/**
 * Retrieves the most recent task results from the database.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const getTaskResults = async (req, res) => {
    try {
        const taskResult = await TaskResults.findOne().sort({ endTime: -1 });
        if (taskResult) {
            res.status(200).json(taskResult);
        } else {
            res.status(404).json({ error: "No task results found" });
        }
    } catch (error) {
        console.error("Error retrieving task results from MongoDB:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



/**
 * Retrieves the most recent task results from the database.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const getAllTaskResults = async (req, res) => {
    try {
        const taskResult = await TaskResults.find()
        if (taskResult) {
            res.status(200).json(taskResult);
        } else {
            res.status(404).json({ error: "No task results found" });
        }
    } catch (error) {
        console.error("Error retrieving task results from MongoDB:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { startTask, stopTask, getTaskResults, getAllTaskResults };
