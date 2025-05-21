// Operações CREATE para o sistema de eventos
import pg from 'pg';
const { Pool } = pg;

// URL de conexão
const connectionString = 'postgresql://postgres:PXTCatpGlxDqrALJyVKfczhnNFRlXePW@gondola.proxy.rlwy.net:19716/railway';
const pool = new Pool({ connectionString });

/**
 * Cria um novo local no banco de dados
 * @param {Object} local - Dados do local a ser criado
 * @returns {Promise<Object>} - O local criado com seu ID
 */
export async function criarLocal(local) {
  const client = await pool.connect();
  
  try {
    const query = `
      INSERT INTO Local (nome, endereco, cidade, estado, cep, capacidade, descricao)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      local.nome,
      local.endereco,
      local.cidade,
      local.estado,
      local.cep,
      local.capacidade,
      local.descricao
    ];
    
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Cria um novo evento no banco de dados
 * @param {Object} evento - Dados do evento a ser criado
 * @returns {Promise<Object>} - O evento criado com seu ID
 */
export async function criarEvento(evento) {
  const client = await pool.connect();
  
  try {
    const query = `
      INSERT INTO Evento (nome, descricao, data_inicio, data_fim, local_id, status, preco_entrada, imagem_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      evento.nome,
      evento.descricao,
      evento.data_inicio,
      evento.data_fim,
      evento.local_id,
      evento.status || 'Agendado',
      evento.preco_entrada,
      evento.imagem_url
    ];
    
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}