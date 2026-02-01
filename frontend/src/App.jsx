import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Login from "./components/Login";
import Level from "./components/Level";

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element = {<Login/>}/>
      <Route path="/Level" element = {<Level/>}/>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
