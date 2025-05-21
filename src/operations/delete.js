// Operações DELETE para o sistema de eventos
import pg from 'pg';
const { Pool } = pg;

// URL de conexão
const connectionString = 'postgresql://postgres:PXTCatpGlxDqrALJyVKfczhnNFRlXePW@gondola.proxy.rlwy.net:19716/railway';
const pool = new Pool({ connectionString });

/**
 * Exclui um local do banco de dados
 * @param {number} id - ID do local a ser excluído
 * @returns {Promise<boolean>} - true se excluído com sucesso, false se não encontrado
 * @throws {Error} - Se houver eventos associados ao local
 */
export async function excluirLocal(id) {
  const client = await pool.connect();
  
  try {
    // Primeiro, verificamos se existem eventos associados a este local
    const eventosAssociados = await client.query(
      'SELECT COUNT(*) FROM Evento WHERE local_id = $1',
      [id]
    );
    
    const count = parseInt(eventosAssociados.rows[0].count);
    if (count > 0) {
      throw new Error(`Não é possível excluir o local com ID ${id} porque existem ${count} eventos associados a ele.`);
    }
    
    // Se não houver eventos associados, podemos excluir o local
    const result = await client.query(
      'DELETE FROM Local WHERE id = $1 RETURNING *',
      [id]
    );
    
    // Retorna true se algum registro foi excluído, false caso contrário
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

/**
 * Exclui um evento do banco de dados
 * @param {number} id - ID do evento a ser excluído
 * @returns {Promise<boolean>} - true se excluído com sucesso, false se não encontrado
 */
export async function excluirEvento(id) {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'DELETE FROM Evento WHERE id = $1 RETURNING *',
      [id]
    );
    
    // Retorna true se algum registro foi excluído, false caso contrário
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

/**
 * Exclui todos os eventos de um determinado local
 * @param {number} localId - ID do local
 * @returns {Promise<number>} - Número de eventos excluídos
 */
export async function excluirEventosPorLocal(localId) {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'DELETE FROM Evento WHERE local_id = $1 RETURNING *',
      [localId]
    );
    
    return result.rows.length;
  } finally {
    client.release();
  }
}

/**
 * Exclui eventos antigos (que já passaram)
 * @returns {Promise<number>} - Número de eventos excluídos
 */
export async function excluirEventosAntigos() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'DELETE FROM Evento WHERE data_fim < NOW() RETURNING *'
    );
    
    return result.rows.length;
  } finally {
    client.release();
  }
}