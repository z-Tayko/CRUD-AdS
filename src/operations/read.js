// Operações READ para o sistema de eventos
import pg from 'pg';
const { Pool } = pg;

// URL de conexão
const connectionString = 'postgresql://postgres:PXTCatpGlxDqrALJyVKfczhnNFRlXePW@gondola.proxy.rlwy.net:19716/railway';
const pool = new Pool({ connectionString });

/**
 * Busca todos os locais
 * @returns {Promise<Array>} - Lista de locais
 */
export async function listarLocais() {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT * FROM Local ORDER BY nome');
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Busca um local pelo ID
 * @param {number} id - ID do local
 * @returns {Promise<Object>} - Dados do local
 */
export async function buscarLocalPorId(id) {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT * FROM Local WHERE id = $1', [id]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Busca locais por cidade
 * @param {string} cidade - Nome da cidade
 * @returns {Promise<Array>} - Lista de locais na cidade
 */
export async function buscarLocaisPorCidade(cidade) {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT * FROM Local WHERE cidade = $1 ORDER BY nome', [cidade]);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Busca todos os eventos
 * @returns {Promise<Array>} - Lista de eventos
 */
export async function listarEventos() {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT * FROM Evento ORDER BY data_inicio');
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Busca um evento pelo ID
 * @param {number} id - ID do evento
 * @returns {Promise<Object>} - Dados do evento
 */
export async function buscarEventoPorId(id) {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT * FROM Evento WHERE id = $1', [id]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Busca eventos com informações do local
 * @returns {Promise<Array>} - Lista de eventos com dados do local
 */
export async function buscarEventosComLocal() {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT e.*, l.nome as nome_local, l.endereco, l.cidade, l.estado
      FROM Evento e
      JOIN Local l ON e.local_id = l.id
      ORDER BY e.data_inicio
    `;
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}