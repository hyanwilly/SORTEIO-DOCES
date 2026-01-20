import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

// ========================================
// FUNÇÕES PARA GERENCIAR SORTEIOS
// ========================================

/**
 * Cria um novo sorteio com 100 números
 * @param {Object} dados - Dados do sorteio (titulo, descricao, imagemUrl, valorNumero)
 * @returns {Promise<string>} - ID do sorteio criado
 */
export const criarSorteio = async (dados) => {
  try {
    // Cria o documento do sorteio
    const sorteioRef = await addDoc(collection(db, 'sorteios'), {
      titulo: dados.titulo,
      descricao: dados.descricao,
      imagemUrl: dados.imagemUrl || '',
      totalNumeros: 100,
      numerosPagos: 0,
      valorNumero: parseFloat(dados.valorNumero),
      status: 'ativo',
      dataCriacao: serverTimestamp(),
      dataSorteio: null,
      ganhador: null
    });

    // Cria os 100 números em batch para otimizar
    const batch = writeBatch(db);
    const numerosRef = collection(db, 'sorteios', sorteioRef.id, 'numeros');

    for (let i = 1; i <= 100; i++) {
      const numeroDoc = doc(numerosRef);
      batch.set(numeroDoc, {
        numero: i,
        status: 'disponivel',
        compradorNome: null,
        compradorEmail: null,
        compradorTelefone: null,
        dataReserva: null,
        dataPagamento: null,
        pagamentoId: null
      });
    }

    await batch.commit();

    console.log('✅ Sorteio criado com sucesso:', sorteioRef.id);
    return sorteioRef.id;
  } catch (error) {
    console.error('❌ Erro ao criar sorteio:', error);
    throw error;
  }
};

/**
 * Busca todos os sorteios ativos
 * @returns {Promise<Array>} - Array de sorteios
 */
export const getSorteiosAtivos = async () => {
  try {
    const q = query(
      collection(db, 'sorteios'),
      where('status', 'in', ['ativo', 'completo']),
      orderBy('dataCriacao', 'desc')
    );

    const snapshot = await getDocs(q);
    const sorteios = [];

    snapshot.forEach((doc) => {
      sorteios.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return sorteios;
  } catch (error) {
    console.error('❌ Erro ao buscar sorteios:', error);
    throw error;
  }
};

/**
 * Busca um sorteio específico por ID
 * @param {string} id - ID do sorteio
 * @returns {Promise<Object>} - Dados do sorteio
 */
export const getSorteio = async (id) => {
  try {
    const docRef = doc(db, 'sorteios', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Sorteio não encontrado');
    }
  } catch (error) {
    console.error('❌ Erro ao buscar sorteio:', error);
    throw error;
  }
};

// ========================================
// FUNÇÕES PARA GERENCIAR NÚMEROS
// ========================================

/**
 * Busca todos os números de um sorteio
 * @param {string} sorteioId - ID do sorteio
 * @returns {Promise<Array>} - Array de números
 */
export const getNumeros = async (sorteioId) => {
  try {
    const q = query(
      collection(db, 'sorteios', sorteioId, 'numeros'),
      orderBy('numero', 'asc')
    );

    const snapshot = await getDocs(q);
    const numeros = [];

    snapshot.forEach((doc) => {
      numeros.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return numeros;
  } catch (error) {
    console.error('❌ Erro ao buscar números:', error);
    throw error;
  }
};

/**
 * Reserva um número para um comprador
 * @param {string} sorteioId - ID do sorteio
 * @param {string} numeroId - ID do documento do número
 * @param {Object} dados - Dados do comprador (nome, email, telefone)
 * @returns {Promise<void>}
 */
export const reservarNumero = async (sorteioId, numeroId, dados) => {
  try {
    const numeroRef = doc(db, 'sorteios', sorteioId, 'numeros', numeroId);

    await updateDoc(numeroRef, {
      status: 'reservado',
      compradorNome: dados.nome,
      compradorEmail: dados.email,
      compradorTelefone: dados.telefone,
      dataReserva: serverTimestamp()
    });

    console.log('✅ Número reservado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao reservar número:', error);
    throw error;
  }
};

/**
 * Confirma o pagamento de um número
 * @param {string} sorteioId - ID do sorteio
 * @param {string} numeroId - ID do documento do número
 * @param {string} pagamentoId - ID do pagamento do Mercado Pago
 * @returns {Promise<void>}
 */
export const confirmarPagamento = async (sorteioId, numeroId, pagamentoId) => {
  try {
    const numeroRef = doc(db, 'sorteios', sorteioId, 'numeros', numeroId);

    await updateDoc(numeroRef, {
      status: 'pago',
      pagamentoId: pagamentoId,
      dataPagamento: serverTimestamp()
    });

    // Atualiza o contador de números pagos no sorteio
    const sorteioRef = doc(db, 'sorteios', sorteioId);
    const sorteioSnap = await getDoc(sorteioRef);
    const numerosPagos = (sorteioSnap.data().numerosPagos || 0) + 1;

    await updateDoc(sorteioRef, {
      numerosPagos: numerosPagos,
      status: numerosPagos >= 100 ? 'completo' : 'ativo'
    });

    console.log('✅ Pagamento confirmado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao confirmar pagamento:', error);
    throw error;
  }
};

/**
 * Ouve mudanças nos números em tempo real
 * @param {string} sorteioId - ID do sorteio
 * @param {Function} callback - Função callback que recebe os números atualizados
 * @returns {Function} - Função unsubscribe para parar de ouvir
 */
export const ouvirNumeros = (sorteioId, callback) => {
  try {
    const q = query(
      collection(db, 'sorteios', sorteioId, 'numeros'),
      orderBy('numero', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const numeros = [];
      snapshot.forEach((doc) => {
        numeros.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(numeros);
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Erro ao ouvir números:', error);
    throw error;
  }
};

/**
 * Ouve mudanças no sorteio em tempo real
 * @param {string} sorteioId - ID do sorteio
 * @param {Function} callback - Função callback que recebe o sorteio atualizado
 * @returns {Function} - Função unsubscribe para parar de ouvir
 */
export const ouvirSorteio = (sorteioId, callback) => {
  try {
    const docRef = doc(db, 'sorteios', sorteioId);

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Erro ao ouvir sorteio:', error);
    throw error;
  }
};

// ========================================
// FUNÇÃO PARA REALIZAR SORTEIO
// ========================================

/**
 * Realiza o sorteio e sorteia um ganhador aleatório
 * @param {string} sorteioId - ID do sorteio
 * @returns {Promise<Object>} - Dados do ganhador
 */
export const realizarSorteio = async (sorteioId) => {
  try {
    // Busca todos os números pagos
    const q = query(
      collection(db, 'sorteios', sorteioId, 'numeros'),
      where('status', '==', 'pago')
    );

    const snapshot = await getDocs(q);
    const numerosPagos = [];

    snapshot.forEach((doc) => {
      numerosPagos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (numerosPagos.length === 0) {
      throw new Error('Nenhum número pago encontrado');
    }

    // Sorteia um número aleatório usando crypto para segurança
    const randomBytes = new Uint32Array(1);
    window.crypto.getRandomValues(randomBytes);
    const randomIndex = randomBytes[0] % numerosPagos.length;
    const numeroSorteado = numerosPagos[randomIndex];

    // Atualiza o sorteio com o ganhador
    const sorteioRef = doc(db, 'sorteios', sorteioId);
    await updateDoc(sorteioRef, {
      status: 'sorteado',
      dataSorteio: serverTimestamp(),
      ganhador: {
        numero: numeroSorteado.numero,
        nome: numeroSorteado.compradorNome,
        email: numeroSorteado.compradorEmail
      }
    });

    console.log('✅ Sorteio realizado com sucesso:', numeroSorteado);
    return numeroSorteado;
  } catch (error) {
    console.error('❌ Erro ao realizar sorteio:', error);
    throw error;
  }
};

/**
 * Libera números reservados que expiraram (mais de 15 minutos)
 * @param {string} sorteioId - ID do sorteio
 * @returns {Promise<number>} - Quantidade de números liberados
 */
export const liberarNumerosExpirados = async (sorteioId) => {
  try {
    const now = new Date();
    const quinzeMinutosAtras = new Date(now.getTime() - 15 * 60 * 1000);

    const q = query(
      collection(db, 'sorteios', sorteioId, 'numeros'),
      where('status', '==', 'reservado')
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    let count = 0;

    snapshot.forEach((doc) => {
      const dataReserva = doc.data().dataReserva?.toDate();
      if (dataReserva && dataReserva < quinzeMinutosAtras) {
        const numeroRef = doc.ref;
        batch.update(numeroRef, {
          status: 'disponivel',
          compradorNome: null,
          compradorEmail: null,
          compradorTelefone: null,
          dataReserva: null
        });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`✅ ${count} números expirados foram liberados`);
    }

    return count;
  } catch (error) {
    console.error('❌ Erro ao liberar números expirados:', error);
    throw error;
  }
};
