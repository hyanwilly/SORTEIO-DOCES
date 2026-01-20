import React, { useState, useEffect } from 'react';
import './Home.css';
import SorteioCard from '../components/Sorteio/SorteioCard';
import { getSorteiosAtivos } from '../firebase/firestore';

/**
 * Página inicial que lista todos os sorteios ativos
 */
function Home() {
  const [sorteios, setSorteios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carrega os sorteios ao montar o componente
  useEffect(() => {
    loadSorteios();
  }, []);

  // Função para carregar sorteios
  const loadSorteios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSorteiosAtivos();
      setSorteios(data);
    } catch (err) {
      console.error('Erro ao carregar sorteios:', err);
      setError('Erro ao carregar sorteios. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">🍬 Bem-vindo ao Sorteio de Doces</h1>
          <p className="hero-subtitle">
            Participe dos nossos sorteios e concorra a prêmios incríveis!
          </p>
        </section>

        {/* Sorteios Section */}
        <section className="sorteios-section">
          <h2 className="section-title">🎯 Sorteios Disponíveis</h2>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Carregando sorteios...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
              <button onClick={loadSorteios} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Tentar Novamente
              </button>
            </div>
          )}

          {!loading && !error && sorteios.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🎲</div>
              <h3>Nenhum sorteio disponível no momento</h3>
              <p>Volte em breve para conferir novos sorteios!</p>
            </div>
          )}

          {!loading && !error && sorteios.length > 0 && (
            <div className="sorteios-grid">
              {sorteios.map((sorteio) => (
                <SorteioCard key={sorteio.id} sorteio={sorteio} />
              ))}
            </div>
          )}
        </section>

        {/* Como Funciona Section */}
        <section className="how-it-works">
          <h2 className="section-title">❓ Como Funciona</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Escolha um Sorteio</h3>
              <p>Navegue pelos sorteios disponíveis e escolha o que mais lhe interessa.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Selecione seu Número</h3>
              <p>Escolha um ou mais números disponíveis no grid de 100 números.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Faça o Pagamento</h3>
              <p>Pague via PIX, cartão ou boleto através do Mercado Pago.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Concorra ao Prêmio</h3>
              <p>Quando todos os números forem vendidos, realizamos o sorteio!</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
