import React, { useState, useEffect } from 'react';
import { HUMEDALES_WORDS } from '../data/words';
import carpinchoImg from '../assets/carpincho_mascot.png';
import './AnagramGame.css';

const AnagramGame = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [wordPool, setWordPool] = useState([]);
  const [mascotState, setMascotState] = useState('idle'); // 'idle', 'happy', 'sad'

  useEffect(() => {
    pickNewWord([...HUMEDALES_WORDS]);
  }, []);

  const scrambleString = (str) => {
    let arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };

  const pickNewWord = (pool = wordPool) => {
    let currentPool = pool;
    if (currentPool.length === 0) {
      currentPool = [...HUMEDALES_WORDS];
    }
    
    const randomIndex = Math.floor(Math.random() * currentPool.length);
    const randomWord = currentPool[randomIndex];
    
    const newPool = currentPool.filter((_, index) => index !== randomIndex);
    setWordPool(newPool);

    setCurrentWord(randomWord);
    
    let scrambled = scrambleString(randomWord);
    while (scrambled === randomWord && randomWord.length > 1) {
      scrambled = scrambleString(randomWord);
    }
    setScrambledWord(scrambled);
    setUserInput('');
    setMessage('');
    setMascotState('idle');
  };

  // Función para ignorar tildes y ESPACIOS al comparar
  const normalize = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .toUpperCase();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (normalize(userInput) === normalize(currentWord)) {
      setMessage('¡Correcto! ¡Muy bien hecho! 🎉');
      setScore(score + 10);
      setMascotState('happy');
      setTimeout(() => {
        pickNewWord(wordPool);
      }, 2000);
    } else {
      setMessage('¡Ups! Intenta de nuevo. ❌');
      setMascotState('sad');
      setTimeout(() => setMascotState('idle'), 1000);
    }
  };

  if (!currentWord) return <div>Cargando...</div>;

  return (
    <div className="anagram-container">
      <div className="game-card">
        <h1>Desafío Acuático de los Humedales 🌊</h1>
        <p className="instructions">Ordena las letras para descubrir las palabras ocultas relacionadas con la vegetación de los bañados y lagunas correntinas.</p>
        
        <p className="score">Puntuación: {score}</p>

        <div className={`mascot-container ${mascotState}`}>
          <img src={carpinchoImg} alt="Mascota Carpincho" className="mascot-img" />
        </div>
        
        <div className="scrambled-word">
          {scrambledWord.split('').map((letter, index) => (
            <span key={index} className="letter-box">{letter}</span>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Escribe la palabra aquí..."
            autoFocus
          />
          <button type="submit" className="submit-btn">Comprobar</button>
        </form>

        {message && <div className={`message ${message.includes('Correcto') ? 'success' : 'error'}`}>{message}</div>}
        
        <button onClick={() => pickNewWord(wordPool)} className="skip-btn">Saltar palabra</button>
      </div>
    </div>
  );
};

export default AnagramGame;
