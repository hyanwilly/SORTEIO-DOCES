import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import SorteioDetalhes from './pages/SorteioDetalhes';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Header com navegação */}
        <header className="app-header">
          <div className="container">
            <Link to="/" className="logo">
              🍬 Sorteio de Doces
            </Link>
            <nav>
              <Link to="/" className="nav-link">Sorteios</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
            </nav>
          </div>
        </header>

        {/* Rotas da aplicação */}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sorteio/:id" element={<SorteioDetalhes />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="container">
            <p>© 2024 Sorteio de Doces - Todos os direitos reservados</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
