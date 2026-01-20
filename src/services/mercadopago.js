import axios from 'axios';

// ⚠️ SUBSTITUA COM SEU ACCESS TOKEN DO MERCADO PAGO
// Acesse: https://www.mercadopago.com.br/developers/panel
// 1. Faça login na sua conta
// 2. Vá em "Suas integrações"
// 3. Crie uma aplicação
// 4. Copie o Access Token (use o de teste primeiro)

const MERCADO_PAGO_ACCESS_TOKEN = 'SEU_ACCESS_TOKEN_AQUI';

// URL base da API do Mercado Pago
const API_BASE_URL = 'https://api.mercadopago.com';

/**
 * Cria uma preferência de pagamento no Mercado Pago
 * @param {Object} dados - Dados do pagamento
 * @param {string} dados.titulo - Título do item
 * @param {number} dados.valor - Valor do item
 * @param {number} dados.quantidade - Quantidade
 * @param {string} dados.email - Email do comprador
 * @param {string} dados.externalReference - Referência externa (sorteioId:numeroId)
 * @returns {Promise<Object>} - Dados da preferência criada
 */
export const criarPagamento = async (dados) => {
  try {
    const preference = {
      items: [
        {
          title: dados.titulo,
          unit_price: parseFloat(dados.valor),
          quantity: parseInt(dados.quantidade),
          currency_id: 'BRL'
        }
      ],
      payer: {
        email: dados.email,
        name: dados.nome || '',
        phone: {
          number: dados.telefone || ''
        }
      },
      external_reference: dados.externalReference,
      back_urls: {
        success: `${window.location.origin}/pagamento/sucesso`,
        failure: `${window.location.origin}/pagamento/falha`,
        pending: `${window.location.origin}/pagamento/pendente`
      },
      auto_return: 'approved',
      notification_url: dados.notificationUrl || '',
      statement_descriptor: 'SORTEIO DOCES',
      payment_methods: {
        excluded_payment_types: [],
        installments: 1
      }
    };

    const response = await axios.post(
      `${API_BASE_URL}/checkout/preferences`,
      preference,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
        }
      }
    );

    console.log('✅ Pagamento criado com sucesso:', response.data.id);
    return {
      id: response.data.id,
      init_point: response.data.init_point, // URL para desktop
      sandbox_init_point: response.data.sandbox_init_point // URL para testes
    };
  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Verifica o status de um pagamento
 * @param {string} paymentId - ID do pagamento
 * @returns {Promise<Object>} - Dados do pagamento
 */
export const verificarPagamento = async (paymentId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
        }
      }
    );

    console.log('✅ Status do pagamento:', response.data.status);
    return {
      id: response.data.id,
      status: response.data.status,
      status_detail: response.data.status_detail,
      external_reference: response.data.external_reference,
      transaction_amount: response.data.transaction_amount,
      payer: response.data.payer
    };
  } catch (error) {
    console.error('❌ Erro ao verificar pagamento:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Busca informações de uma preferência de pagamento
 * @param {string} preferenceId - ID da preferência
 * @returns {Promise<Object>} - Dados da preferência
 */
export const buscarPreferencia = async (preferenceId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/checkout/preferences/${preferenceId}`,
      {
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar preferência:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Status de pagamento do Mercado Pago:
 * - pending: Aguardando pagamento
 * - approved: Pagamento aprovado
 * - authorized: Pagamento autorizado
 * - in_process: Em análise
 * - in_mediation: Em mediação
 * - rejected: Rejeitado
 * - cancelled: Cancelado
 * - refunded: Reembolsado
 * - charged_back: Contestado
 */
export const STATUS_PAGAMENTO = {
  PENDING: 'pending',
  APPROVED: 'approved',
  AUTHORIZED: 'authorized',
  IN_PROCESS: 'in_process',
  IN_MEDIATION: 'in_mediation',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  CHARGED_BACK: 'charged_back'
};
