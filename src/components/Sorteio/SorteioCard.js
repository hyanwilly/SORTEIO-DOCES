import React from 'react';
import { Link } from 'react-router-dom';
import './SorteioCard.css';

/**
 * Componente de card para exibir um sorteio
 * @param {Object} props
 * @param {Object} props.sorteio - Dados do sorteio
 */
function SorteioCard({ sorteio }) {
  // Calcula a porcentagem de números vendidos
  const porcentagemVendida = Math.round((sorteio.numerosPagos / sorteio.totalNumeros) * 100);

  // Determina o status visual
  const getStatusBadge = () => {
    switch (sorteio.status) {
      case 'ativo':
        return <span className="badge badge-success">Ativo</span>;
      case 'completo':
        return <span className="badge badge-warning">Completo</span>;
      case 'sorteado':
        return <span className="badge badge-info">Sorteado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="sorteio-card">
      {/* Imagem do prêmio */}
      <div className="sorteio-image">
        {sorteio.imagemUrl ? (
          <img src={sorteio.imagemUrl} alt={sorteio.titulo} />
        ) : (
          <div className="placeholder-image">🍬</div>
        )}
        {getStatusBadge()}
      </div>

      {/* Informações do sorteio */}
      <div className="sorteio-info">
        <h3 className="sorteio-titulo">{sorteio.titulo}</h3>
        <p className="sorteio-descricao">{sorteio.descricao}</p>

        {/* Barra de progresso */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${porcentagemVendida}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <span>{sorteio.numerosPagos}/{sorteio.totalNumeros} vendidos</span>
            <span>{porcentagemVendida}%</span>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="sorteio-details">
          <div className="detail-item">
            <span className="detail-label">Valor:</span>
            <span className="detail-value">
              R$ {sorteio.valorNumero?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Ganhador (se já foi sorteado) */}
        {sorteio.status === 'sorteado' && sorteio.ganhador && (
          <div className="ganhador-info">
            <h4>🏆 Ganhador:</h4>
            <p>
              <strong>{sorteio.ganhador.nome}</strong> - Número {sorteio.ganhador.numero}
            </p>
          </div>
        )}

        {/* Botão de ação */}
        <Link 
          to={`/sorteio/${sorteio.id}`} 
          className={`btn ${sorteio.status === 'sorteado' ? 'btn-secondary' : 'btn-primary'}`}
        >
          {sorteio.status === 'sorteado' ? 'Ver Resultado' : 'Participar'}
        </Link>
      </div>
    </div>
  );
}

export default SorteioCard;
