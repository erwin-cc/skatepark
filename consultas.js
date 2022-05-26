const { Pool } = require('pg')

// Archivo de configuración para conectarse a local
/*const config = {
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    database: 'skatepark',
    port: 5432
}*/

const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}

const pool = new Pool(config)

const registrar = async (datos) => {
    const values = Object.values(datos)
    const consulta = {
        text: 'insert into skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) values ($1,$2,$3,$4,$5,$6,$7) returning*',
        values
    }
    const res = await pool.query(consulta)
    return res
}

const getParticipantes = async () => {
    const res = await pool.query("select * from skaters where nombre not in ('admin', 'Admin')")
    return res
}

const actualizarParticipante = async (datos) => {
    const values = Object.values(datos)
    const consulta = {
        text: "update skaters set nombre=$2, password=$3, anos_experiencia=$4, especialidad=$5 where email=$1 returning*",
        values
    }
    const res = await pool.query(consulta)
    return res
}

const eliminarParticipante = async (email) => {
    const consulta = {
        text: "delete from skaters where email=$1 returning*",
        values: [email]
    }
    const res = await pool.query(consulta)
    return res
}

const getAll = async () => {
    const res = await pool.query("select * from skaters")
    return res
}

const actualizarEstado = async (datos) => {
    const values = Object.values(datos)
    const consulta = {
        text: "update skaters set estado = $1 where email = $2 returning*",
        values
    }
    res = await pool.query(consulta)
    return res
}

module.exports = { registrar, getParticipantes, actualizarParticipante, eliminarParticipante, getAll, actualizarEstado }