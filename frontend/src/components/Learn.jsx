import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';
import Navbar from './Navbar';
import ASLDetector from "./ASLDetector";

function Learn() {

    return (
        <>
            <Navbar />
            <div style={{ backgroundColor: '#0527A6', minHeight: '100vh' }}>
            <ASLDetector />;
            </div>

        </>
    );
}

export default Learn;