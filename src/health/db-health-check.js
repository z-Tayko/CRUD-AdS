// Sistema de health check para o banco de dados
import pg from 'pg';
const { Pool } = pg;

// URL de conexão
const connectionString = 'postgresql://postgres:PXTCatpGlxDqrALJyVKfczhnNFRlXePW@gondola.proxy.rlwy.net:19716/railway';
const pool = new Pool({ connectionString });

/**
 * Verifica a saúde do banco de dados
 * @returns {Promise<Object>} - Status de saúde do banco de dados
 */
export async function checkDatabaseHealth() {
  // Objeto para armazenar os resultados de cada verificação
  const healthStatus = {
    connection: false,
    tables: {
      local: false,
      evento: false
    },
    queries: {
      selectLocal: false,
      selectEvento: false,
      joinLocalEvento: false
    },
    functions: {
      listarEventosPorLocal: false,
      listarEventosPorPeriodo: false
    },
    overall: false
  };
  
  let client;
  
  try {
    console.log('Iniciando verificação de saúde do banco de dados...');
    
    // Passo 1: Verificar conexão com o banco
    console.log('Passo 1: Verificando conexão com o banco de dados...');
    client = await pool.connect();
    healthStatus.connection = true;
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Passo 2: Verificar se as tabelas existem
    console.log('Passo 2: Verificando se as tabelas existem...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('local', 'evento')
    `;
    
    const tablesResult = await client.query(tablesQuery);
    
    // Verificar cada tabela individualmente
    tablesResult.rows.forEach(row => {
      healthStatus.tables[row.table_name] = true;
      console.log(`✅ Tabela ${row.table_name} existe`);
    });
    
    // Passo 3: Executar consultas simples em cada tabela
    console.log('Passo 3: Executando consultas simples em cada tabela...');
    
    // Verificar tabela Local
    try {
      const localQuery = 'SELECT COUNT(*) FROM Local';
      const localResult = await client.query(localQuery);
      const localCount = parseInt(localResult.rows[0].count);
      healthStatus.queries.selectLocal = true;
      console.log(`✅ Consulta na tabela Local executada com sucesso (${localCount} registros)`);
    } catch (error) {
      console.log('❌ Erro ao consultar tabela Local:', error.message);
    }
    
    // Verificar tabela Evento
    try {
      const eventoQuery = 'SELECT COUNT(*) FROM Evento';
      const eventoResult = await client.query(eventoQuery);
      const eventoCount = parseInt(eventoResult.rows[0].count);
      healthStatus.queries.selectEvento = true;
      console.log(`✅ Consulta na tabela Evento executada com sucesso (${eventoCount} registros)`);
    } catch (error) {
      console.log('❌ Erro ao consultar tabela Evento:', error.message);
    }
    
    // Verificar JOIN entre Local e Evento
    try {
      const joinQuery = `
        SELECT COUNT(*) 
        FROM Evento e
        JOIN Local l ON e.local_id = l.id
      `;
      const joinResult = await client.query(joinQuery);
      const joinCount = parseInt(joinResult.rows[0].count);
      healthStatus.queries.joinLocalEvento = true;
      console.log(`✅ Consulta JOIN entre Local e Evento executada com sucesso (${joinCount} registros)`);
    } catch (error) {
      console.log('❌ Erro ao executar JOIN entre Local e Evento:', error.message);
    }
    
    // Passo 4: Verificar se as funções estão funcionando
    console.log('Passo 4: Verificando se as funções estão funcionando...');
    
    // Verificar função listar_eventos_por_local
    try {
      // Primeiro verificamos se a função existe
      const functionCheckQuery = `
        SELECT COUNT(*) 
        FROM pg_proc 
        WHERE proname = 'listar_eventos_por_local'
      `;
      const functionExists = await client.query(functionCheckQuery);
      
      if (parseInt(functionExists.rows[0].count) > 0) {
        // Se a função existe, tentamos executá-la
        const functionQuery = 'SELECT * FROM listar_eventos_por_local(1) LIMIT 1';
        await client.query(functionQuery);
        healthStatus.functions.listarEventosPorLocal = true;
        console.log('✅ Função listar_eventos_por_local está funcionando');
      } else {
        console.log('❌ Função listar_eventos_por_local não existe');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar função listar_eventos_por_local:', error.message);
    }
    
    // Verificar função listar_eventos_por_periodo
    try {
      // Primeiro verificamos se a função existe
      const functionCheckQuery = `
        SELECT COUNT(*) 
        FROM pg_proc 
        WHERE proname = 'listar_eventos_por_periodo'
      `;
      const functionExists = await client.query(functionCheckQuery);
      
      if (parseInt(functionExists.rows[0].count) > 0) {
        // Se a função existe, tentamos executá-la com um período amplo para garantir resultados
        const functionQuery = `
          SELECT * FROM listar_eventos_por_periodo(
            '2000-01-01 00:00:00'::timestamp, 
            '2100-12-31 23:59:59'::timestamp
          ) LIMIT 1
        `;
        await client.query(functionQuery);
        healthStatus.functions.listarEventosPorPeriodo = true;
        console.log('✅ Função listar_eventos_por_periodo está funcionando');
      } else {
        console.log('❌ Função listar_eventos_por_periodo não existe');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar função listar_eventos_por_periodo:', error.message);
    }
    
    // Passo 5: Determinar o status geral
    console.log('Passo 5: Determinando o status geral do banco de dados...');
    
    // Verificar se a conexão está ok
    if (!healthStatus.connection) {
      console.log('❌ Falha na conexão com o banco de dados');
      healthStatus.overall = false;
      return healthStatus;
    }
    
    // Verificar se todas as tabelas existem
    const tablesOk = Object.values(healthStatus.tables).every(status => status === true);
    if (!tablesOk) {
      console.log('❌ Falha na verificação de tabelas');
      healthStatus.overall = false;
      return healthStatus;
    }
    
    // Verificar se todas as consultas básicas funcionam
    const queriesOk = Object.values(healthStatus.queries).every(status => status === true);
    if (!queriesOk) {
      console.log('❌ Falha na execução de consultas básicas');
      healthStatus.overall = false;
      return healthStatus;
    }
    
    // Se chegamos até aqui, o banco de dados está saudável
    healthStatus.overall = true;
    console.log('✅ Banco de dados está saudável!');
    
    return healthStatus;
    
  } catch (error) {
    console.error('Erro durante a verificação de saúde:', error);
    return healthStatus;
  } finally {
    // Liberando a conexão
    if (client) {
      client.release();
    }
  }
}

// Função para criar um endpoint de health check
export async function healthCheckEndpoint() {
  try {
    const health = await checkDatabaseHealth();
    
    if (health.overall) {
      return {
        status: 'ok',
        message: 'Sistema de banco de dados funcionando corretamente',
        details: health
      };
    } else {
      return {
        status: 'error',
        message: 'Problemas detectados no sistema de banco de dados',
        details: health
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Erro ao verificar a saúde do banco de dados',
      error: error.message
    };
  }
}

// Executar o health check
if (require.main === module) {
  checkDatabaseHealth().then(result => {
    console.log('\n--- RESULTADO DO HEALTH CHECK ---');
    console.log(JSON.stringify(result, null, 2));
    pool.end();
  });
}