import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';
import Sidebar from './SideBar';
import { useLocation } from 'react-router-dom';

function Level() {
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
      <Sidebar username={username} />
      <div>
        <h1>{username}</h1>

      </div>
    </>
  );
}

export default Level;