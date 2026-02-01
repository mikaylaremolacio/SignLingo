import { useNavigate } from 'react-router-dom';
import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';

function Navbar() {
    const navigate = useNavigate();

    return (
        <header className="containerHeader" >
            <div>
                <img src={signLingoLogo} alt="SignLingo Logo" className="navLogoHeader" />
            </div>
            <nav>
                <ul className="backButton">
                    <li onClick={() => navigate("/level")} >BACK</li>
                </ul>
            </nav>
        </header >
    );
}

export default Navbar;