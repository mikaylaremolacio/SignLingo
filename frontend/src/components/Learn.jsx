import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';
import Navbar from './Navbar';
//<<<<<<< HEAD
import { useLocation } from 'react-router-dom';
import ASLDetector from "./ASLDetector";


    
//=======
import ASLDetector from "./ASLDetector";

function Learn() {
    const location = useLocation();
    const username = location.state?.username;

//>>>>>>> main
    return (
        <>
            <Navbar username={username}/>
            <div style={{ backgroundColor: '#0527A6', minHeight: '100vh' }}>
            <ASLDetector />;
            </div>

        </>
    );
}

export default Learn;