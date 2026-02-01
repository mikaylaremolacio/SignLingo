import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

function Learn() {
    const location = useLocation();
    const username = location.state?.username;
    
    return (
        <>
            <Navbar username={username}/>
            <div style={{ backgroundColor: '#0527A6', minHeight: '100vh' }}>

            </div>

        </>
    );
}

export default Learn;