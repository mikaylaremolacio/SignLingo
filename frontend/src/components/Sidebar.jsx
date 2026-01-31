import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';

function Sidebar() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <aside className="sidebar">
        <div className="sidebarContent">
          <div className="logoSection">
            <img src={signLingoLogo} alt="SignLingo Logo" className="sidebarLogo" />
          </div>

          <nav className="sidebarNav">
            <button
              className="sidebarButton homeButton"
              onClick={() => navigate("/learn")}
            >
              HOME
            </button>

            <button
              className="sidebarButton progressButton"
              onClick={() => navigate("/progress")}
            >
              PROGRESS
            </button>

            <div className="reviewsSection">
              <div className="reviewsHeader">
                <span className="reviewsText">REVIEWS</span>
                <button
                  className="questionIcon"
                  onClick={() => setShowPopup(true)}
                >
                  ?
                </button>
              </div>
              <div className="reviewsCounter">
                <span className="reviewsNumber">10</span>
              </div>
              <button
                className="sidebarButton startButton"
                onClick={() => navigate("/reviews")}
              >
                START
              </button>
            </div>
          </nav>

          <footer className="sidebarFooter">
            <div className="footerLinks">
              <a href="/about">About Us</a>
              <a href="/team">Team</a>
              <a href="/policy">Policy</a>
              <a href="/feedback">Feedback</a>
            </div>
            <p className="copyright">© 2026 SignLingo. ElleHacks</p>
          </footer>
        </div>
      </aside>

      {/* Popup */}
      {showPopup && (
        <div className="popupOverlay" onClick={() => setShowPopup(false)}>
          <div className="popupContent" onClick={(e) => e.stopPropagation()}>
            <div className="popupHeader">
              <button className="popupQuestionIcon">?</button>
              <div className="popupTitle">Ready to look through studied terms again?</div>
            </div>
            <div className="popupBody">
              <p>
                In the review section Murphy (our blob fish mascot you see at the top right corner!) drops already unlocked letters and words. You'll see a term on the screen and have a chance to sign it during a 20 second window. If a gesture feels tricky to remember, Murphy will drop it here a little more often— helping your memory grow stronger and making each sign feel more familiar over time.
              </p>
            </div>
            <button className="popupCloseButton" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;