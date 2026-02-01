import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';
import { useEffect, useState } from 'react';
import LevelCard from './LevelCard';

function LevelList({ username }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [letterLevels, setLetterLevels] = useState({});
    const [userLevel, setUserLevel] = useState(0);

    useEffect(() => {
        const fetchLevel = async () => {
            if (!username) {
                setError("Username is required.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("http://localhost:3000/progress/home-information", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username }),
                });

                const data = await response.json();

                if (response.ok) {
                    setLetterLevels(data.homePageInfo.letterLevels);
                    setUserLevel(data.homePageInfo.userInfo.level);
                    setLoading(false);
                } else {
                    setError(data.errorMessage || "Can't find data");
                    setLoading(false);
                }
            } catch (err) {
                setError("Network error. Please try again later.");
                console.error(err);
                setLoading(false);
            }

        };

        fetchLevel();

    }, [username]);

    const isLevelUnlocked = (levelNumber) => {
        if (levelNumber <= userLevel) {
            return true;
        } else {
            return false;
        }
    };

    const levels = Object.keys(letterLevels)
        .map(Number)
        .sort((a, b) => a - b)
        .map((levelNum) => ({
            num: levelNum,
            letters: letterLevels[levelNum],
        }));

    return (
        <div className="levelCardContent">
            <h1>{username}</h1>
            <div>
                <section>
                    {levels.map((level) => {
                        const unlockedLevel = isLevelUnlocked(level.num);

                        return (
                            <LevelCard
                                key={level.num}
                                levelNum={level.num}
                                letters={level.letters}
                                isUnlocked={unlockedLevel}
                                username={username}
                            />
                        );
                    })}
                </section>
            </div>
        </div>
    );
};

export default LevelList;