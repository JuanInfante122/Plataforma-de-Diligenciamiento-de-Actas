const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
  try {
    // Primero conectamos sin seleccionar una base de datos
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    // Crear la base de datos si no existe
    await connection.query('CREATE DATABASE IF NOT EXISTS sistema_documentacion');
    console.log('Base de datos creada o verificada');

    // Seleccionar la base de datos
    await connection.query('USE sistema_documentacion');

    // Leer y ejecutar el archivo schema.sql
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Dividir y ejecutar cada sentencia SQL
    const statements = schema.split(';').filter(statement => statement.trim());
    for (let statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    console.log('Esquema de base de datos creado');

    // Leer y ejecutar el archivo seed.sql
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seed = await fs.readFile(seedPath, 'utf8');
    
    // Dividir y ejecutar cada sentencia SQL de datos de prueba
    const seedStatements = seed.split(';').filter(statement => statement.trim());
    for (let statement of seedStatements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    console.log('Datos de prueba insertados');

    await connection.end();
    console.log('Inicialización de la base de datos completada');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar la inicialización
initializeDatabase();