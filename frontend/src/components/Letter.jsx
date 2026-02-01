import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function Letter() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [allLetters, setAllLetters] = useState([]);
    const [userLetters, setUserLetters] = useState([]);
    const location = useLocation();
    const username = location.state?.username;

    useEffect(() => {

        const fetchLetters = async () => {

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

        if (username) {
            fetchLetters();
        }
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
        <div>
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
    );
};

export default Letter;