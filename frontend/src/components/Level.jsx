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

            <div className="reviewsSection">
              <div className="reviewsHeader">
                <span className="reviewsText">1</span>
              </div>
              <div className="reviewsCounter">
                <span className="reviewsNumber">10</span>
              </div>
              <button
                className="sidebarButton startButton"
                onClick={() => navigate("/reviews", {state: { username }})}
              >
                START
              </button>
            </div>


    </>
  );
}

export default Level;