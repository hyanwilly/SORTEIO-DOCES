import React, { useState } from 'react';
import './AdminPanel.css';
import { criarSorteio, realizarSorteio } from '../../firebase/firestore';

/**
 * Componente do painel administrativo
 * Permite criar novos sorteios e realizar o sorteio
 */
function AdminPanel({ sorteios, onUpdate }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    imagemUrl: '',
    valorNumero: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Atualiza os dados do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Cria um novo sorteio
  const handleCreateSorteio = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.titulo || !formData.descricao || !formData.valorNumero) {
      setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const sorteioId = await criarSorteio(formData);
      setMessage({ 
        type: 'success', 
        text: `Sorteio criado com sucesso! ID: ${sorteioId}` 
      });
      
      // Limpa o formulário
      setFormData({
        titulo: '',
        descricao: '',
        imagemUrl: '',
        valorNumero: ''
      });

      // Atualiza a lista
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Erro ao criar sorteio: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Realiza o sorteio
  const handleRealizarSorteio = async (sorteioId) => {
    if (!window.confirm('Tem certeza que deseja realizar o sorteio agora?')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const ganhador = await realizarSorteio(sorteioId);
      setMessage({ 
        type: 'success', 
        text: `Sorteio realizado! Ganhador: ${ganhador.compradorNome} - Número ${ganhador.numero}` 
      });
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Erro ao realizar sorteio: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <h2>🎯 Painel Administrativo</h2>

      {/* Mensagens de feedback */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Formulário para criar novo sorteio */}
      <div className="admin-section">
        <h3>➕ Criar Novo Sorteio</h3>
        <form onSubmit={handleCreateSorteio} className="admin-form">
          <div className="form-group">
            <label htmlFor="titulo">Título do Sorteio *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ex: Cesta de Chocolates"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição *</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Descreva o prêmio do sorteio..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="imagemUrl">URL da Imagem</label>
            <input
              type="url"
              id="imagemUrl"
              name="imagemUrl"
              value={formData.imagemUrl}
              onChange={handleInputChange}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="valorNumero">Valor por Número (R$) *</label>
            <input
              type="number"
              id="valorNumero"
              name="valorNumero"
              value={formData.valorNumero}
              onChange={handleInputChange}
              placeholder="5.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Criando...' : '✨ Criar Sorteio'}
          </button>
        </form>
      </div>

      {/* Lista de sorteios ativos */}
      <div className="admin-section">
        <h3>📋 Sorteios Gerenciados</h3>
        
        {sorteios && sorteios.length > 0 ? (
          <div className="sorteios-list">
            {sorteios.map(sorteio => (
              <div key={sorteio.id} className="sorteio-admin-card">
                <div className="sorteio-admin-info">
                  <h4>{sorteio.titulo}</h4>
                  <p className="sorteio-admin-status">
                    Status: <span className={`status-${sorteio.status}`}>{sorteio.status}</span>
                  </p>
                  <p className="sorteio-admin-progress">
                    Vendidos: {sorteio.numerosPagos}/100 números
                  </p>
                  <p className="sorteio-admin-valor">
                    Valor: R$ {sorteio.valorNumero?.toFixed(2)} por número
                  </p>
                  
                  {sorteio.ganhador && (
                    <p className="sorteio-admin-ganhador">
                      🏆 Ganhador: {sorteio.ganhador.nome} (Nº {sorteio.ganhador.numero})
                    </p>
                  )}
                </div>

                <div className="sorteio-admin-actions">
                  {sorteio.status === 'completo' && (
                    <button
                      className="btn btn-success"
                      onClick={() => handleRealizarSorteio(sorteio.id)}
                      disabled={loading}
                    >
                      🎲 Realizar Sorteio
                    </button>
                  )}
                  
                  {sorteio.status === 'sorteado' && (
                    <span className="badge badge-success">✅ Sorteado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">Nenhum sorteio criado ainda.</p>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
