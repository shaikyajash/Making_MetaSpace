import React, { useState } from 'react';
import './App.css';
import GameScreen from './screens/GameScreen';
import { Route, Routes } from 'react-router-dom';
import Lobby from './screens/Lobby';


const App = () => {

  return(
    <Routes>
      <Route path='/' element={<Lobby/>} />
      <Route path='/room' element={<GameScreen/>} />

    </Routes>
  ) 
};

export default App;