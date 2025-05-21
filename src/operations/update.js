// Operações UPDATE para o sistema de eventos
import pg from 'pg';
const { Pool } = pg;

// URL de conexão
const connectionString = 'postgresql://postgres:PXTCatpGlxDqrALJyVKfczhnNFRlXePW@gondola.proxy.rlwy.net:19716/railway';
const pool = new Pool({ connectionString });

/**
 * Atualiza um local existente
 * @param {number} id - ID do local a ser atualizado
 * @param {Object} dadosAtualizados - Novos dados do local
 * @returns {Promise<Object>} - O local atualizado
 */
export async function atualizarLocal(id, dadosAtualizados) {
  const client = await pool.connect();
  
  try {
    // Primeiro, verificamos se o local existe
    const verificacao = await client.query('SELECT * FROM Local WHERE id = $1', [id]);
    if (verificacao.rows.length === 0) {
      throw new Error(`Local com ID ${id} não encontrado`);
    }
    
    // Construímos a query de atualização dinamicamente
    const campos = [];
    const valores = [];
    let contador = 1;
    
    // Para cada campo nos dados atualizados, adicionamos à query
    Object.entries(dadosAtualizados).forEach(([campo, valor]) => {
      if (campo !== 'id' && valor !== undefined) { // Ignoramos o ID e valores undefined
        campos.push(`${campo} = $${contador}`);
        valores.push(valor);
        contador++;
      }
    });
    
    // Se não houver campos para atualizar, retornamos o local original
    if (campos.length === 0) {
      return verificacao.rows[0];
    }
    
    // Adicionamos o ID como último parâmetro
    valores.push(id);
    
    // Construímos e executamos a query
    const query = `
      UPDATE Local 
      SET ${campos.join(', ')} 
      WHERE id = $${contador}
      RETURNING *
    `;
    
    const result = await client.query(query, valores);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Atualiza um evento existente
 * @param {number} id - ID do evento a ser atualizado
 * @param {Object} dadosAtualizados - Novos dados do evento
 * @returns {Promise<Object>} - O evento atualizado
 */
export async function atualizarEvento(id, dadosAtualizados) {
  const client = await pool.connect();
  
  try {
    // Primeiro, verificamos se o evento existe
    const verificacao = await client.query('SELECT * FROM Evento WHERE id = $1', [id]);
    if (verificacao.rows.length === 0) {
      throw new Error(`Evento com ID ${id} não encontrado`);
    }
    
    // Construímos a query de atualização dinamicamente
    const campos = [];
    const valores = [];
    let contador = 1;
    
    // Para cada campo nos dados atualizados, adicionamos à query
    Object.entries(dadosAtualizados).forEach(([campo, valor]) => {
      if (campo !== 'id' && valor !== undefined) { // Ignoramos o ID e valores undefined
        campos.push(`${campo} = $${contador}`);
        valores.push(valor);
        contador++;
      }
    });
    
    // Se não houver campos para atualizar, retornamos o evento original
    if (campos.length === 0) {
      return verificacao.rows[0];
    }
    
    // Adicionamos o ID como último parâmetro
    valores.push(id);
    
    // Construímos e executamos a query
    const query = `
      UPDATE Evento 
      SET ${campos.join(', ')} 
      WHERE id = $${contador}
      RETURNING *
    `;
    
    const result = await client.query(query, valores);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Atualiza o status de um evento
 * @param {number} id - ID do evento
 * @param {string} novoStatus - Novo status do evento
 * @returns {Promise<Object>} - O evento atualizado
 */
export async function atualizarStatusEvento(id, novoStatus) {
  const client = await pool.connect();
  
  try {
    // Verificamos se o status é válido
    const statusValidos = ['Agendado', 'Confirmado', 'Cancelado', 'Concluído'];
    if (!statusValidos.includes(novoStatus)) {
      throw new Error(`Status inválido. Deve ser um dos seguintes: ${statusValidos.join(', ')}`);
    }
    
    const query = `
      UPDATE Evento 
      SET status = $1 
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await client.query(query, [novoStatus, id]);
    
    if (result.rows.length === 0) {
      throw new Error(`Evento com ID ${id} não encontrado`);
    }
    
    return result.rows[0];
  } finally {
    client.release();
  }
}