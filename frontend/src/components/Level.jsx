import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';
import Sidebar from './SideBar';
import { useLocation } from 'react-router-dom';
import LevelList from './LevelList';

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
      <LevelList username={username} />
    </>
  );
}

export default Level;