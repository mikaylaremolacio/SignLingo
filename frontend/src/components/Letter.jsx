import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';
import { useEffect, useState } from 'react';

function Letter({ username }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [allLetters, setAllLetters] = useState([]);
    const [userLetters, setUserLetters] = useState([]);

    useEffect(() => {
        const fetchLetters = async () => {
            if (!username) {
                setError("Username is required.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("http://localhost:3000/progress", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username }),
                });

                const data = await response.json();

                if (response.ok) {
                    setAllLetters(data.progress.allLetters);
                    setUserLetters(data.progress.userLetters);
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

        fetchLetters();

    }, [username]);

    const isLetterUnLocked = (letter) => {
        const letterFound = userLetters.find((userLetter) => userLetter.letter === letter);

        if (letterFound) {
            return true;
        } else {
            return false;
        }

    };

    return (
        <div className="progressContent">
            <div className="progressContentContainer"> 
                <h2>{username}</h2>
                <section>

                    {allLetters.map((letterObject) => {

                        const unlockedLetters = isLetterUnLocked(letterObject.letter);

                        if (unlockedLetters) {
                            return (
                                <button key={letterObject._id} >
                                    {letterObject.letter}
                                </button>
                            );
                        } else {
                            return (
                                <button key={letterObject._id} disabled >
                                    {letterObject.letter}
                                </button>
                            );
                        }
                    })}

                </section>
            </div>

        </div>
    );
};

export default Letter;