const { Router } = require("express");

const ProgressModel = require("./progress-model");
const LetterModel = require('../letters/letters-model');

const progressRoute = Router();

/* 
    1
 */
//Get information for Progress Page display and Expanded Letter View PopUp
progressRoute.post("/", async (req, res) => {
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
            level: letter.level,
            streak: letter.review.repetitions,
            correctReviews: letter.review.correctReviews,
            incorrectReviews: letter.review.incorrectReviews,
            interval: letter.review.interval,
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


/* 
    2
 */
//Get Information about Letters to form Levels [to be implemented in this function :( )] and User Progress (username + levels) to filter current user level
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

        //An array of levelsLLDS:K"CE<D?X"L<A
        const letterLevels = new Map();
        allLetters.forEach((letter) => {
            if (!letterLevels.has(letter.level)) {
                letterLevels.set(letter.level, [{ letter: letter.letter, id: letter.id }]);
            }
            else {

                const oldValue = letterLevels.get(letter.level);
                const newValue = [...oldValue, { letter: letter.letter, id: letter.id }];
                letterLevels.set(letter.level, newValue);
            }
        });

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

const letterLevelsObj = Object.fromEntries(letterLevels);
        res.status(200).send({ homePageInfo: { userInfo: userInfo, letterLevels: letterLevelsObj } });

    } catch (err) {
        console.error(err);
        res.status(500).send({ errorMessage: "Internal server error" });
    }
});


/* 
    3
 */
//GET Review Letters for the LEVEL PAGE (when level is opened)
progressRoute.get("/:id", async (req, res) => {
    try {
        const levelId = parseInt(req.params.id);

        // Get ALL LETTERS for the LEVEL
        const levelLetters = await LetterModel.find({ level: levelId });
        if (!levelLetters) {
            return res.status(404).send({
                errorMessage: `Letters for level ${levelId} not found`,
            });
        }

        res.status(200).send({ levelLetters: levelLetters });

    } catch (err) {
        console.error(err);
        res.status(500).send({ errorMessage: "Internal server error" });
    }
});

/* 
    4
 */
//POST FOR UPDATING USER PROGRESS AFTER LEVEL COMPLETION
progressRoute.post("/update", async (req, res) => {

    try {
        const { username } = req.body;
        const userProgress = await ProgressModel.findOne({ username });
        if (!userProgress) {
            return res.status(404).send({
                errorMessage: `Progress for user ${username} doesn't exist`,
            });
        }

        // Update the user's level
        const newLevel = userProgress.level + 1;
        userProgress.level = newLevel;
        await userProgress.save();

        // Get ALL LETTERS for the COMPLETED LEVEL
        const levelLetters = await LetterModel.find({ level: newLevel - 1 });
        if (!levelLetters) {
            return res.status(404).send({
                errorMessage: `Letters for level ${newLevel - 1} not found`,
            });
        }

        for (const letter of levelLetters) {
            let currentDate = new Date();
            // append an object of a new letter to user's letterProgress array
            userProgress.letters.push({
                letter: letter.letter,
                level: letter.level,
                review: {
                    interval: 1,
                    easeFactor: 2.5,
                    repetitions: 1,
                    nextReviewAt: new Date(currentDate.getTime() + (24 * 60 * 60 * 1000)),
                    lastReviewedAt: null,
                    correctReviews: 1,
                    incorrectReviews: 0,
                },
            })
        };

        await userProgress.save();
        res.status(200).send({ message: "User progress updated successfully", progress: userProgress.letters });

    } catch (err) {
        console.error(err);
        res.status(500).send({ errorMessage: "Internal server error" });
    }
});

/* 
    5
 */
//POST for retrieving ALL USER LETTERS PROGRESS and RETURNING TODAY's REVIEWS
progressRoute.post("/today-reviews", async (req, res) => {
    try {
        const { username } = req.body;

        // Get USER PROGRESS based on USERNAME => get LETTER PROGRESS
        const userProgress = await ProgressModel.findOne({ username });
        if (!userProgress) {
            return res.status(404).send({
                errorMessage: `Progress for user ${username} doesn't exist`,
            });
        }

        // Filter letters that are due for review today or earlier
        const today = new Date();
        const dueReviews = userProgress.letters.filter(letter => {
            return new Date(letter.review.nextReviewAt) <= today;
        });

        res.status(200).send({ dueReviews: dueReviews });

    } catch (err) {
        console.error(err);
        res.status(500).send({ errorMessage: "Internal server error" });
    }
});

/*
    6 NOT WORKING YET
*/
//POST for UPDATING USER LETTER PROGRESS after a REVIEW RESULT (TB invoked after each term in review session)
progressRoute.post("/review-result ", async (req, res) => {
    try {
        const { username, letter, result } = req.body;

        // Get USER PROGRESS based on USERNAME => get LETTER PROGRESS
        const userProgress = await ProgressModel.findOne({ username });
        if (!userProgress) {
            return res.status(404).send({
                errorMessage: `Progress for user ${username} doesn't exist`,
            });
        }

        // Find the specific letter to update
        const letterToAdvance = userProgress.letters.find(l => l.letter === letter);

        // SRS Algorithm Implementation
        if (result === "correct") {
            letterToAdvance.review.interval += 1;
            letterToAdvance.review.easeFactor += 1;
            letterToAdvance.review.repetitions += 1;
            letterToAdvance.review.nextReviewAt = new Date(letterToAdvance.review.nextReviewAt.getTime() + (24 * 60 * 60 * 1000));
            letterToAdvance.review.lastReviewedAt = new Date();
            letterToAdvance.review.correctReviews += 1;
            letterToAdvance.review.correctReviews += 1;
            letterToAdvance.review.correctReviews += 1;
        } else {
            letterToAdvance.review.incorrectReviews += 1;
        }

        let newInterval = 0;
        if (result === "correct") {
            if (repetitions === 0) {
                newInterval = 1;
            } else if (repetitions === 1) {
                newInterval = 6;
            } else {
                newInterval = Math.round(interval * easeFactor);
            }
        } else {
            newInterval = 1; // Reset interval on incorrect review
        }

        letterToAdvance.review.interval = newInterval;
        letterToAdvance.review.repetitions += 1;

        // Update next review date
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
        letterToAdvance.review.nextReviewAt = nextReviewDate;

        await userProgress.save();
        res.status(200).send({ message: "Letter progress updated successfully", updatedLetter: letterToAdvance });

    } catch (err) {
        console.error(err);
        res.status(500).send({ errorMessage: "Internal server error" });
    }


});



module.exports = { progressRoute };
