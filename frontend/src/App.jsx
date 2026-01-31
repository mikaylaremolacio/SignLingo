import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Welcome from "./Welcome";
import Navbar from "./Navbar";

function App() {

  return (
    <BrowserRouter>
  <Navbar />
      <Routes>
        <Route path="/" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
