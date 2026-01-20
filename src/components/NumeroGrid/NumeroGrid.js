import React, { useState, useEffect } from 'react';
import './NumeroGrid.css';

/**
 * Componente que exibe o grid de 100 números do sorteio
 * @param {Object} props
 * @param {Array} props.numeros - Array com os 100 números
 * @param {Function} props.onNumeroClick - Callback ao clicar em um número
 */
function NumeroGrid({ numeros, onNumeroClick }) {
  const [selectedNumero, setSelectedNumero] = useState(null);

  // Função para determinar a classe CSS baseada no status
  const getStatusClass = (status) => {
    switch (status) {
      case 'disponivel':
        return 'disponivel';
      case 'reservado':
        return 'reservado';
      case 'pago':
        return 'pago';
      default:
        return 'disponivel';
    }
  };

  // Função para lidar com o clique em um número
  const handleNumeroClick = (numero) => {
    if (numero.status === 'disponivel') {
      setSelectedNumero(numero);
      if (onNumeroClick) {
        onNumeroClick(numero);
      }
    }
  };

  // Ordena os números antes de renderizar
  const numerosOrdenados = [...numeros].sort((a, b) => a.numero - b.numero);

  return (
    <div className="numero-grid-container">
      <div className="grid-legend">
        <div className="legend-item">
          <span className="legend-color disponivel"></span>
          <span>Disponível</span>
        </div>
        <div className="legend-item">
          <span className="legend-color reservado"></span>
          <span>Reservado</span>
        </div>
        <div className="legend-item">
          <span className="legend-color pago"></span>
          <span>Vendido</span>
        </div>
      </div>

      <div className="numero-grid">
        {numerosOrdenados.map((numero) => (
          <div
            key={numero.id}
            className={`numero-item ${getStatusClass(numero.status)} ${
              selectedNumero?.id === numero.id ? 'selected' : ''
            }`}
            onClick={() => handleNumeroClick(numero)}
            title={
              numero.status === 'disponivel'
                ? `Número ${numero.numero} - Clique para reservar`
                : numero.status === 'reservado'
                ? `Número ${numero.numero} - Reservado`
                : `Número ${numero.numero} - Vendido`
            }
          >
            <span className="numero-value">{numero.numero}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NumeroGrid;
