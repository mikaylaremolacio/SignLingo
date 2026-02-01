import './component.css';
import { useNavigate } from 'react-router-dom';

function LevelCard({ levelNum, letters, isUnlocked, username }) {
    const navigate = useNavigate();

    if (isUnlocked) {
        return (
            <div  className="cardContainer">
                <div className="cardHeader">
                    LEVEL {levelNum}
                    <div className="cardLetter">
                        {letters.map((item, index) => (
                            <div key={item.id || index}>
                                {item.letter}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => {
                        navigate(`/learn/`, { state: { username } });
                    }}>START</button>
                </div>
            </div>
        );
    } else {
        return (
            <div>
                LEVEL {levelNum}
                <div>
                    {letters.map((item, index) => (
                        <div key={item.id || index}>
                            {item.letter}
                        </div>
                    ))}
                </div>
                <div>🔒</div>
            </div>
        );
    }
};

export default LevelCard;