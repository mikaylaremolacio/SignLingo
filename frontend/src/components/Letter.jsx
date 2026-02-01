import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';
import { useEffect, useState } from 'react';

function Letter({ username }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [allLetters, setAllLetters] = useState([]);
    const [userLetters, setUserLetters] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState({});

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

    const calculateAccuracy = (correctReviews, incorrectReviews) => {
        const totalReviews = correctReviews + incorrectReviews;
        if (totalReviews === 0) return 0;
        return ((correctReviews / totalReviews) * 100).toFixed(0);
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
                                <button key={letterObject._id}
                                    onClick={() => {

                                        const userLetterData = userLetters.find((userLetter) => userLetter.letter === letterObject.letter);

                                        setSelectedLetter(userLetterData || letterObject);
                                        setShowPopup(true)
                                    }}>
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

            {/* Popup */}
            {showPopup && (
                <div className="popupOverlay" onClick={() => setShowPopup(false)}>
                    <div className="popupContent" onClick={(e) => e.stopPropagation()}>

                        <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "center"}}>

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px", borderRadius: "10px"}}>
                                <div className="letterPopupHeader">
                                    <h1>{selectedLetter.letter} : LEVEL {selectedLetter.level}</h1>
                                </div>
                                <div className="letterDetail">STREAK: {selectedLetter.streak}</div>
                                <div className="letterDetail">ACCURACY: {calculateAccuracy(selectedLetter.correctReviews, selectedLetter.incorrectReviews)}%</div>
                                <p className='letterText'>Next review in {selectedLetter.interval} days</p>
                            </div>

                            <p style={{ backgroundColor: "white", width: "300px", height: "300px", display: "flex", justifyContent: "left", alignItems: "center", border: "1px", borderRadius: "20px" }}>
                                <img src={`../handimage/${selectedLetter.letter}.svg`} alt={selectedLetter.letter} width="250" height="250" />
                            </p>

                        </div>



                        <button className="popupCloseButton" onClick={() => setShowPopup(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>

    );
};

export default Letter;