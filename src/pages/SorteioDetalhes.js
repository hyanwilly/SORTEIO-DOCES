import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SorteioDetalhes.css';
import NumeroGrid from '../components/NumeroGrid/NumeroGrid';
import { 
  getSorteio, 
  ouvirNumeros, 
  ouvirSorteio, 
  reservarNumero 
} from '../firebase/firestore';
import { criarPagamento } from '../services/mercadopago';

/**
 * Página de detalhes do sorteio
 * Exibe o grid de números e formulário de compra
 */
function SorteioDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [sorteio, setSorteio] = useState(null);
  const [numeros, setNumeros] = useState([]);
  const [selectedNumero, setSelectedNumero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Dados do formulário de compra
  const [compradorData, setCompradorData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });

  // Carrega o sorteio e configura listeners em tempo real
  useEffect(() => {
    if (!id) return;

    loadSorteio();

    // Listener para mudanças nos números em tempo real
    const unsubscribeNumeros = ouvirNumeros(id, (numerosAtualizados) => {
      setNumeros(numerosAtualizados);
    });

    // Listener para mudanças no sorteio em tempo real
    const unsubscribeSorteio = ouvirSorteio(id, (sorteioAtualizado) => {
      setSorteio(sorteioAtualizado);
    });

    // Cleanup: para de ouvir quando o componente é desmontado
    return () => {
      unsubscribeNumeros();
      unsubscribeSorteio();
    };
  }, [id]);

  // Carrega os dados iniciais do sorteio
  const loadSorteio = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSorteio(id);
      setSorteio(data);
    } catch (err) {
      console.error('Erro ao carregar sorteio:', err);
      setError('Sorteio não encontrado');
    } finally {
      setLoading(false);
    }
  };

  // Lida com a seleção de um número
  const handleNumeroClick = (numero) => {
    if (numero.status === 'disponivel') {
      setSelectedNumero(numero);
      setShowCheckout(true);
    }
  };

  // Atualiza os dados do comprador
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompradorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Processa o checkout e cria o pagamento
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!selectedNumero || !sorteio) {
      return;
    }

    // Validação básica
    if (!compradorData.nome || !compradorData.email || !compradorData.telefone) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setProcessingPayment(true);

    try {
      // 1. Reserva o número no Firestore
      await reservarNumero(id, selectedNumero.id, compradorData);

      // 2. Cria o pagamento no Mercado Pago
      const pagamento = await criarPagamento({
        titulo: `${sorteio.titulo} - Número ${selectedNumero.numero}`,
        valor: sorteio.valorNumero,
        quantidade: 1,
        email: compradorData.email,
        nome: compradorData.nome,
        telefone: compradorData.telefone,
        externalReference: `${id}:${selectedNumero.id}`,
        notificationUrl: `${window.location.origin}/api/webhook/mercadopago`
      });

      // 3. Redireciona para a página de pagamento do Mercado Pago
      // Em ambiente de teste, use sandbox_init_point
      // Em produção, use init_point
      window.location.href = pagamento.init_point || pagamento.sandbox_init_point;

    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      alert('Erro ao processar pagamento. Tente novamente.');
      setProcessingPayment(false);
    }
  };

  // Fecha o formulário de checkout
  const handleCloseCheckout = () => {
    setShowCheckout(false);
    setSelectedNumero(null);
    setCompradorData({
      nome: '',
      email: '',
      telefone: ''
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Carregando sorteio...</p>
      </div>
    );
  }

  if (error || !sorteio) {
    return (
      <div className="container">
        <div className="alert alert-error">
          {error || 'Sorteio não encontrado'}
          <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  const porcentagemVendida = Math.round((sorteio.numerosPagos / sorteio.totalNumeros) * 100);

  return (
    <div className="sorteio-detalhes-page">
      <div className="container">
        {/* Informações do Sorteio */}
        <div className="sorteio-header">
          <button onClick={() => navigate('/')} className="btn-back">
            ← Voltar
          </button>
          
          <div className="sorteio-header-content">
            {sorteio.imagemUrl && (
              <div className="sorteio-image-large">
                <img src={sorteio.imagemUrl} alt={sorteio.titulo} />
              </div>
            )}
            
            <div className="sorteio-header-info">
              <h1>{sorteio.titulo}</h1>
              <p className="sorteio-descricao-full">{sorteio.descricao}</p>
              
              <div className="sorteio-stats">
                <div className="stat-item">
                  <span className="stat-label">Valor por número</span>
                  <span className="stat-value">R$ {sorteio.valorNumero?.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Números vendidos</span>
                  <span className="stat-value">{sorteio.numerosPagos}/100</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Progresso</span>
                  <span className="stat-value">{porcentagemVendida}%</span>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="progress-bar-large">
                <div 
                  className="progress-fill-large" 
                  style={{ width: `${porcentagemVendida}%` }}
                ></div>
              </div>

              {/* Status do sorteio */}
              {sorteio.status === 'sorteado' && sorteio.ganhador && (
                <div className="winner-announcement">
                  <h2>🏆 Sorteio Realizado!</h2>
                  <p>
                    <strong>Ganhador:</strong> {sorteio.ganhador.nome}
                  </p>
                  <p>
                    <strong>Número sorteado:</strong> {sorteio.ganhador.numero}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid de Números */}
        {sorteio.status !== 'sorteado' && (
          <div className="numeros-section">
            <h2>Escolha seu Número da Sorte</h2>
            <NumeroGrid numeros={numeros} onNumeroClick={handleNumeroClick} />
          </div>
        )}

        {/* Modal de Checkout */}
        {showCheckout && selectedNumero && (
          <div className="checkout-modal" onClick={handleCloseCheckout}>
            <div className="checkout-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal" onClick={handleCloseCheckout}>×</button>
              
              <h2>🎯 Finalizar Compra</h2>
              <p className="modal-subtitle">
                Você selecionou o número <strong>{selectedNumero.numero}</strong>
              </p>

              <div className="purchase-summary">
                <div className="summary-item">
                  <span>Número:</span>
                  <strong>{selectedNumero.numero}</strong>
                </div>
                <div className="summary-item">
                  <span>Valor:</span>
                  <strong>R$ {sorteio.valorNumero?.toFixed(2)}</strong>
                </div>
              </div>

              <form onSubmit={handleCheckout} className="checkout-form">
                <div className="form-group">
                  <label htmlFor="nome">Nome Completo *</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={compradorData.nome}
                    onChange={handleInputChange}
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">E-mail *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={compradorData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefone">Telefone/WhatsApp *</label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={compradorData.telefone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-success btn-large"
                  disabled={processingPayment}
                >
                  {processingPayment ? 'Processando...' : '💳 Ir para Pagamento'}
                </button>

                <p className="payment-info">
                  Você será redirecionado para o Mercado Pago para concluir o pagamento de forma segura.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SorteioDetalhes;
