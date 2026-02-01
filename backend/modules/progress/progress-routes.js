const { Router } = require("express");

const ProgressModel = require("./progress-model");
const LetterModel = require('../letters/letter-model');

const progressRoute = Router();

//Get information for Progress Page display and Expanded Letter View PopUp
progressRoute.post("/progress", async (req, res) => {
    try {
        const { username } = req.body;

        // Get PROGRESS DATA based on USERNAME => Get LETTER PROGRESS => retrieve needed attributes and store in array
        const userProgress = await ProgressModel.findOne({ username });
        if (!userProgress) {
            return res.status(404).send({
                errorMessage: `Progress for user ${username} doesn't exist`,
            });
        }

        // store NEEDED LETTER PROGRESS
        const letterProgress = userProgress.letters || [];
        const userLetters = letterProgress.map((letter) => ({
            letter: letter.letter,
            streak: letter.review.repetitions,
            correctReviews: letter.review.correctReviews,
            incorrectReviews: letter.review.incorrectReviews,
            nextReviewAt: letter.review.nextReviewAt,
        }));

        // Get ALL LETTERS (for display and filtering what letters user has/doesnt have)
        const allLetters = await LetterModel.find({});
        if (!allLetters) {
            return res.status(404).send({
                errorMessage: `Letters not found`,
            });
        }

        res.status(200).send({ progress: { userLetters: userLetters, allLetters: allLetters } });

    } catch (err) {
        console.error(err);
        res.status(500).send({ errorMessage: "Internal server error" });
    }
}
);



//Get Information about Letters to form Levels and User Progress (username + levels) to filter current user level
progressRoute.post("/home-information", async (req, res) => {
    try {
        const { username } = req.body;

        // Get ALL LETTERS (for filtering locked/unlocked levels)
        const allLetters = await LetterModel.find({});
        if (!allLetters) {
            return res.status(404).send({
                errorMessage: `Letters not found`,
            });
        }

        // Get USER PROGRESS based on USERNAME => get LEVEL
        const userProgress = await ProgressModel.findOne({ username });
        if (!userProgress) {
            return res.status(404).send({
                errorMessage: `Progress for user ${username} doesn't exist`,
            });
        }
        // store NEEDED USER INFO
        const userInfo = {
            username: username,
            level: userProgress.level,
        };

        res.status(200).send({ homePageInfo: { userInfo: userInfo, allLetters: allLetters } });

    } catch (err) {
        console.error(err);
        res.status(500).send({ errorMessage: "Internal server error" });
    }
});


module.exports = { progressRoute };
