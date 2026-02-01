import './component.css';
import signLingoLogo from '../assets/signLingoLogo.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submit, setSubmit] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setError("");
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmit(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if(response.ok){
        navigate("/level", { state: { user: data.user.username } });
      }else{
        setError(data.errorMessage || "Login failed. Please try again.");
        setSubmit(false);
      }
    } catch (err){
      alert("Network error. Please try again later.");
      console.error(err);
      setSubmit(false);
    }

  };

  return (
    <main className="containerLogin">
      <div className="leftSection">
        <img src={signLingoLogo} alt="SignLingo Logo" width={400} height={400} />
        <div className="descriptionText">
          <p>Practice fingerspelling and American Sign Language through interactive lessons designed to help you succeed. Forgetting signs is normal, so we've got you covered! Our Review section uses spaced repetition to help you revisit what you've learned at the perfect time, making it easier to remember and build long-term skills.</p>
        </div>
      </div>

      <div className="rightSection">
        <div className="welcomeText">
          <h1>Welcome to SignLingo</h1>
          <p className="subtitle">Your place to learn ASL with confidence</p>
        </div>

        <section className="sectionLogin">
          <h2 className="loginTitle">Log in</h2>
          <form onSubmit={handleSubmit} className="loginForm">
            <input
              type="text"
              placeholder="Username"
              className="inputField"
              onChange={handleUsernameChange}
              value={username}
              disabled={submit}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="inputField"
              onChange={handlePasswordChange}
              value={password}
              disabled={submit}
              required
            />

            {error && <p className="errorMessage">{error}</p>}

            <p className="noAccount">Don't have an account?</p>
            <button type="submit" disabled={submit} className="button">Log in</button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Login;
