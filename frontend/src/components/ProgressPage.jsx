import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';
import Sidebar from './SideBar';
import Letter from './letter';
import { useLocation } from 'react-router-dom';

function Progress() {

    const location = useLocation();
    const username = location.state?.username;
    if (!username) {
        return (
            <div>
                <h2>Username not found. Please log in again.</h2>
            </div>
        );
    }
    return (
        <>
            <div className="containerProgress">
                <Sidebar username={username} />
                <Letter username={username} />
            </div>
        </>
    );
}

export default Progress;