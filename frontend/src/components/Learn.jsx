import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';
import Navbar from './Navbar';
<<<<<<< HEAD
import { useLocation } from 'react-router-dom';

function Learn() {
    const location = useLocation();
    const username = location.state?.username;
    
=======
import ASLDetector from "./ASLDetector";

function Learn() {

>>>>>>> main
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