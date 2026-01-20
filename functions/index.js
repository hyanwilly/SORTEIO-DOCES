const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Inicializa o Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ⚠️ SUBSTITUA COM SEU ACCESS TOKEN DO MERCADO PAGO
const MERCADO_PAGO_ACCESS_TOKEN = 'SEU_ACCESS_TOKEN_AQUI';

// ========================================
// WEBHOOK DO MERCADO PAGO
// ========================================

/**
 * Webhook para receber notificações do Mercado Pago
 * Confirma pagamentos automaticamente quando aprovados
 */
exports.webhookMercadoPago = functions.https.onRequest(async (req, res) => {
  console.log('📥 Webhook recebido:', req.body);

  // Verifica se é uma notificação de pagamento
  if (req.body.type === 'payment') {
    const paymentId = req.body.data.id;

    try {
      // Busca informações do pagamento na API do Mercado Pago
      const response = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
          }
        }
      );

      const payment = response.data;
      console.log('💳 Pagamento:', payment.status, payment.external_reference);

      // Se o pagamento foi aprovado
      if (payment.status === 'approved') {
        // Extrai sorteioId e numeroId da referência externa
        const [sorteioId, numeroId] = payment.external_reference.split(':');

        if (sorteioId && numeroId) {
          // Atualiza o número para "pago"
          const numeroRef = db.collection('sorteios').doc(sorteioId)
            .collection('numeros').doc(numeroId);

          await numeroRef.update({
            status: 'pago',
            pagamentoId: paymentId,
            dataPagamento: admin.firestore.FieldValue.serverTimestamp()
          });

          // Atualiza o contador de números pagos
          const sorteioRef = db.collection('sorteios').doc(sorteioId);
          const sorteioDoc = await sorteioRef.get();
          const numerosPagos = (sorteioDoc.data().numerosPagos || 0) + 1;

          await sorteioRef.update({
            numerosPagos: numerosPagos,
            status: numerosPagos >= 100 ? 'completo' : 'ativo'
          });

          console.log('✅ Pagamento confirmado com sucesso!');
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      res.status(500).send('Error');
    }
  } else {
    res.status(200).send('OK');
  }
});

// ========================================
// CRON JOB - EXPIRAR RESERVAS
// ========================================

/**
 * Função agendada que executa a cada 5 minutos
 * Libera números reservados há mais de 15 minutos sem pagamento
 */
exports.expirarReservas = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    console.log('⏰ Executando job de expiração de reservas...');

    try {
      // Busca todos os sorteios ativos
      const sorteiosSnapshot = await db.collection('sorteios')
        .where('status', '==', 'ativo')
        .get();

      let totalExpirados = 0;

      // Para cada sorteio ativo
      for (const sorteioDoc of sorteiosSnapshot.docs) {
        const sorteioId = sorteioDoc.id;

        // Busca números reservados
        const numerosSnapshot = await db.collection('sorteios')
          .doc(sorteioId)
          .collection('numeros')
          .where('status', '==', 'reservado')
          .get();

        const now = new Date();
        const quinzeMinutosAtras = new Date(now.getTime() - 15 * 60 * 1000);

        // Para cada número reservado
        for (const numeroDoc of numerosSnapshot.docs) {
          const dataReserva = numeroDoc.data().dataReserva?.toDate();

          // Se foi reservado há mais de 15 minutos
          if (dataReserva && dataReserva < quinzeMinutosAtras) {
            await numeroDoc.ref.update({
              status: 'disponivel',
              compradorNome: null,
              compradorEmail: null,
              compradorTelefone: null,
              dataReserva: null
            });

            totalExpirados++;
            console.log(`🔓 Número ${numeroDoc.data().numero} do sorteio ${sorteioId} foi liberado`);
          }
        }
      }

      console.log(`✅ Job finalizado. Total de números expirados: ${totalExpirados}`);
      return null;
    } catch (error) {
      console.error('❌ Erro ao expirar reservas:', error);
      return null;
    }
  });

// ========================================
// FUNÇÃO AUXILIAR - VERIFICAR PAGAMENTO
// ========================================

/**
 * Função callable para verificar status de um pagamento manualmente
 * Útil para debug e para usuários verificarem seus pagamentos
 */
exports.verificarPagamento = functions.https.onCall(async (data, context) => {
  const { paymentId } = data;

  if (!paymentId) {
    throw new functions.https.HttpsError('invalid-argument', 'Payment ID é obrigatório');
  }

  try {
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
        }
      }
    );

    return {
      status: response.data.status,
      status_detail: response.data.status_detail,
      external_reference: response.data.external_reference
    };
  } catch (error) {
    console.error('❌ Erro ao verificar pagamento:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao verificar pagamento');
  }
});
