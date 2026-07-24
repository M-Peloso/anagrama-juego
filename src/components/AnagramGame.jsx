import React, { useState, useEffect } from 'react';
import { HUMEDALES_WORDS } from '../data/words';
import carpinchoImg from '../assets/carpincho_mascot.png';
import yacareImg from '../assets/yacare_mascot.png';
import sapitoImg from '../assets/sapito_mascot.png';
import './AnagramGame.css';

const MASCOTS = [
  { img: carpinchoImg, alt: "Carpincho" },
  { img: yacareImg, alt: "Yacaré" },
  { img: sapitoImg, alt: "Sapito" }
];

const AnagramGame = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [currentHint, setCurrentHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [wordPool, setWordPool] = useState([]);
  const [mascotState, setMascotState] = useState('idle'); // 'idle', 'happy', 'sad'
  const [currentMascot, setCurrentMascot] = useState(MASCOTS[0]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    pickNewWord([...HUMEDALES_WORDS]);
  }, []);

  const playSound = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const animal = currentMascot.alt;

      if (type === 'success') {
        if (animal === 'Sapito') {
          // Croac feliz agudo
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        } else if (animal === 'Yacaré') {
          // Gruñido alegre
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
          oscillator.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.2);
        } else { // Carpincho
          // Sonido gordito y suave
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.2);
        }
        
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'error') {
        if (animal === 'Sapito') {
          // Croac triste grave
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.2);
        } else if (animal === 'Yacaré') {
          // Gruñido enojado y bajo
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
          oscillator.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.3);
        } else { // Carpincho
          // Quejido suave
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(250, audioCtx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.3);
        }

        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
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
      setGameOver(true);
      return;
    }
    let currentPool = pool;
    
    const randomIndex = Math.floor(Math.random() * currentPool.length);
    const randomItem = currentPool[randomIndex];
    
    const newPool = currentPool.filter((_, index) => index !== randomIndex);
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
    setMascotState('idle');
    
    setCurrentMascot(MASCOTS[Math.floor(Math.random() * MASCOTS.length)]);
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
      setScore(Math.max(0, score - 5)); // Resta 5 puntos, no baja de 0
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (normalize(userInput) === normalize(currentWord)) {
      setMessage('¡Correcto! ¡Muy bien hecho! 🎉');
      setScore(score + 10);
      setMascotState('happy');
      playSound('success');
      setTimeout(() => {
        pickNewWord(wordPool);
      }, 2000);
    } else {
      setMessage('¡Ups! Intenta de nuevo. ❌');
      setMascotState('sad');
      playSound('error');
      setTimeout(() => setMascotState('idle'), 1000);
    }
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    pickNewWord([...HUMEDALES_WORDS]);
  };

  if (gameOver) {
    return (
      <div className="anagram-container">
        <div className="game-card">
          <h1>¡Juego Terminado! 🎉</h1>
          <p className="instructions">¡Has descubierto todas las palabras de los Humedales!</p>
          <div className="mascot-container happy">
            <img src={currentMascot.img} alt={currentMascot.alt} className="mascot-img" />
          </div>
          <p className="score" style={{ fontSize: '2rem' }}>Puntuación Final: {score}</p>
          <button onClick={resetGame} className="submit-btn" style={{ marginTop: '20px', width: '100%' }}>Volver a jugar</button>
        </div>
      </div>
    );
  }

  if (!currentWord) return <div>Cargando...</div>;

  return (
    <div className="anagram-container">
      <div className="game-card">
        <h1>Desafío Acuático de los Humedales 🌊</h1>
        <p className="instructions">Ordena las letras para descubrir las palabras ocultas relacionadas con la vegetación de los bañados y lagunas correntinas.</p>
        
        <p className="score">Puntuación: {score}</p>

        <div className={`mascot-container ${mascotState}`}>
          <img src={currentMascot.img} alt={currentMascot.alt} className="mascot-img" />
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
        
        <button onClick={() => pickNewWord(wordPool)} className="skip-btn">Saltar palabra</button>
      </div>
    </div>
  );
};

export default AnagramGame;
