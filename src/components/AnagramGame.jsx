import React, { useState, useEffect } from 'react';
import { HUMEDALES_WORDS } from '../data/words';
import './AnagramGame.css';

const MAX_SCORE = HUMEDALES_WORDS.length * 10;

const AnagramGame = () => {
  const [gameState, setGameState] = useState('START'); // 'START', 'PLAYING', 'GAMEOVER'
  const [currentWord, setCurrentWord] = useState('');
  const [currentHint, setCurrentHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [wordPool, setWordPool] = useState([]);

  const startGame = () => {
    setScore(0);
    const initialPool = [...HUMEDALES_WORDS];
    setWordPool(initialPool);
    setGameState('PLAYING');
    pickNewWord(initialPool);
  };

  const playSound = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'error') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.2);
      }
    } catch (e) {
      console.log('Audio not supported', e);
    }
  };

  const scrambleString = (str) => {
    let arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };

  const pickNewWord = (pool = wordPool) => {
    if (pool.length === 0) {
      setGameState('GAMEOVER');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * pool.length);
    const randomItem = pool[randomIndex];
    
    const newPool = pool.filter((_, index) => index !== randomIndex);
    setWordPool(newPool);

    setCurrentWord(randomItem.word);
    setCurrentHint(randomItem.hint);
    setShowHint(false);
    
    let scrambled = scrambleString(randomItem.word);
    while (scrambled === randomItem.word && randomItem.word.length > 1) {
      scrambled = scrambleString(randomItem.word);
    }
    setScrambledWord(scrambled);
    setUserInput('');
    setMessage('');
  };

  const normalize = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .toUpperCase();
  };

  const useHint = () => {
    if (!showHint) {
      setShowHint(true);
      setScore(Math.max(0, score - 5)); // Resta 5 puntos
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (normalize(userInput) === normalize(currentWord)) {
      setMessage('¡Correcto! ¡Muy bien hecho! 🎉');
      setScore(score + 10);
      playSound('success');
      setTimeout(() => {
        pickNewWord(wordPool);
      }, 2000);
    } else {
      setMessage('¡Ups! Intenta de nuevo. ❌');
      playSound('error');
    }
  };

  // --- PANTALLA DE INICIO ---
  if (gameState === 'START') {
    return (
      <div className="anagram-container">
        <div className="game-card">
          <h1>Desafío Acuático de los Humedales 🌊</h1>
          <p className="instructions">
            Ordena las letras para descubrir las palabras ocultas relacionadas con la vegetación de los bañados y lagunas correntinas.
          </p>
          <button onClick={startGame} className="submit-btn" style={{ marginTop: '30px', width: '100%', fontSize: '1.5rem', padding: '20px' }}>
            Comenzar a jugar
          </button>
        </div>
      </div>
    );
  }

  // --- PANTALLA FINAL ---
  if (gameState === 'GAMEOVER') {
    const percentage = Math.round((score / MAX_SCORE) * 100);
    
    return (
      <div className="anagram-container">
        <div className="game-card">
          <h1>¡Juego Terminado! 🎉</h1>
          <p className="instructions">¡Has descubierto todas las palabras de los Humedales!</p>
          
          <div className="score-board" style={{ margin: '30px 0', padding: '20px', background: '#f1f8e9', borderRadius: '15px' }}>
            <p style={{ fontSize: '1.2rem', color: '#33691e', marginBottom: '10px' }}>Puntuación Final: {score} pts</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: percentage >= 60 ? '#27ae60' : '#e67e22' }}>
              {percentage}%
            </p>
          </div>

          <button onClick={startGame} className="submit-btn" style={{ marginTop: '10px', width: '100%' }}>
            Volver a jugar
          </button>
        </div>
      </div>
    );
  }

  // --- PANTALLA DE JUEGO ---
  if (!currentWord) return null;

  return (
    <div className="anagram-container">
      <div className="game-card">
        <h1>Desafío Acuático de los Humedales 🌊</h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p className="instructions" style={{ margin: 0, textAlign: 'left', flex: 1 }}>Ordena las letras para descubrir las palabras ocultas.</p>
          <p className="score" style={{ margin: 0, paddingLeft: '15px' }}>Puntuación: {score}</p>
        </div>
        
        <div className="scrambled-word">
          {scrambledWord.split('').map((letter, index) => (
            <span key={index} className="letter-box">{letter}</span>
          ))}
        </div>

        {showHint ? (
          <div className="hint-box">💡 Pista: {currentHint}</div>
        ) : (
          <button type="button" onClick={useHint} className="skip-btn" style={{marginBottom: '15px', color: '#f39c12'}}>
            💡 Ver pista (-5 puntos)
          </button>
        )}

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
        
        <button onClick={() => pickNewWord(wordPool)} className="skip-btn" style={{ marginTop: '15px' }}>
          Saltar palabra
        </button>
      </div>
    </div>
  );
};

export default AnagramGame;
