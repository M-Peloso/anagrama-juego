import React from 'react'
import AnagramGame from './components/AnagramGame'
import './index.css'

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <a href="https://milagros-peloso.vercel.app/" className="back-link">
          ← Volver a Flora de Corrientes
        </a>
      </nav>
      <AnagramGame />
    </div>
  )
}

export default App
