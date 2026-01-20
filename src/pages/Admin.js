import React, { useState, useEffect } from 'react';
import AdminPanel from '../components/Admin/AdminPanel';
import { getSorteiosAtivos } from '../firebase/firestore';

/**
 * Página de administração
 * Permite criar e gerenciar sorteios
 */
function Admin() {
  const [sorteios, setSorteios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega os sorteios ao montar o componente
  useEffect(() => {
    loadSorteios();
  }, []);

  // Função para carregar sorteios
  const loadSorteios = async () => {
    try {
      setLoading(true);
      const data = await getSorteiosAtivos();
      setSorteios(data);
    } catch (error) {
      console.error('Erro ao carregar sorteios:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      ) : (
        <AdminPanel sorteios={sorteios} onUpdate={loadSorteios} />
      )}
    </div>
  );
}

export default Admin;
