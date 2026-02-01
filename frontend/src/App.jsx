import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Login from "./components/Login";
import Level from "./components/Level";
import Learn from "./components/Learn";

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element = {<Login/>}/>
      <Route path="/Level" element = {<Level/>}/>
      <Route path="/Learn" element = {<Learn/>}/>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
