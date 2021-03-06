const express = require('express')
const app = express()
const hbs = require('express-handlebars')
const fu = require('express-fileupload')
const jwt = require('jsonwebtoken')
const fs = require('fs').promises
const { registrar, getParticipantes, actualizarParticipante, eliminarParticipante, getAll, actualizarEstado } = require(`${__dirname}/consultas.js`)


app.use("/public", express.static(`${__dirname}/public`))

app.use(express.urlencoded({ extended: true }))

app.use(express.json())

app.use(fu())

app.set("view engine", "handlebars")
app.engine(
    'handlebars',
    hbs.engine({
        layoutsDir: `${__dirname}/views`,
        partialsDir: `${__dirname}/views/partials`
    })
)

const port = process.env.PORT;
if (port == "" || port == null) {
    port=3000
}

app.listen(port, () => console.log("Servidor activo."))


const llaveSecreta = "clavemuysecreta";

//Ruta inicial
app.get("/", async (req, res) => {
    try {
        const participantesData = await getParticipantes()
        const participantes = participantesData.rows
        res.render(`index`, {
            layout: 'index',
            participantes
        })
    } catch (error) {
        res.status(500).send({ Descripcion: err.message, Error: err })
    }
})

//Ruta para registrarse
app.get("/register", (req, res) => {
    res.render('Registro', { layout: "Registro" })
})

//Ruta para iniciar sesión
app.get("/login", (req, res) => {
    res.render('Login', { layout: "Login" })
})

let usuarioConectado = [];
//Midleware para verificar token
app.use("/dashboard", (req, res, next) => {
    const token = req.query.token

    if (!token) {
        return res.redirect("/login")
    }

    jwt.verify(token, llaveSecreta, (err, data) => {
        if (err) {
            return res.redirect("/login")
        }
        usuarioConectado = [data.data];
        next();
    })
})

// Aca se deriba al dashboard con los datos del usuario o a la plataforma del administrador 
// si es que este último logea con su email, que para este ejercicio es "admin@mail.com".
// En una situacion real, el campo correo de la base de datos, debiese tener la restricción de ser único.
app.get("/dashboard", async (req, res) => {

    if (usuarioConectado[0].email == "admin@mail.com") {
        try {
            const participantesData = await getParticipantes()
            const participantes = participantesData.rows
            res.render('Admin', {
                layout: "Admin",
                participantes
            })
        } catch (error) {
            res.status(500).send({ Descripcion: err.message, Error: err })
        }
    } else {
        res.render('Datos', {
            layout: "Datos",
            usuarioConectado
        })
    }
})

//Ruta POST para enviar datos de registro
app.post("/register", async (req, res) => {
    const datos = req.body
    const { foto } = req.files
    //Manejo de archivo de imagen y envío de datos
    if (foto.size >= 5000000) {
        res.status(500).send("El peso de la imagen no puede superar los 5 MB")
    } else {
        if (foto.mimetype == "image/png" || foto.mimetype == "image/jpeg") {
            const extension = foto.mimetype == "image/png" ? ".png" : ".jpg"
            const nombre = `${datos.nombre}${extension}`
            foto.mv(`${__dirname}/public/uploads/${nombre}`, (err) => {
                if (err) {
                    return res.status(500).send("Ha ocurrido un error intentando subir la imagen")
                }
            })
            datos.foto = nombre
            datos.estado = false
            try {
                await registrar(datos)
                res.redirect("/")
            } catch (err) {
                res.status(500).send({ Descripcion: err.message, Error: err })
            }
        } else {
            res.status(500).send("Formato de archivo invalido. Debe ser PNG o JPG")
        }
    }
})

//Ruta POST para enviar datos de inicio sesión
app.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const participantesData = await getAll()
        const participantes = participantesData.rows
        const usuario = participantes.find(participante => participante.email == email && participante.password == password)
        if (!usuario) {
            return res.redirect("/login")
        } else {
            //Creación de token luego de autenticación
            const token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + 60,
                data: usuario
            }, llaveSecreta)
            res.redirect(`/dashboard?token=${token}`)
        }
    } catch (err) {
        res.status(500).send({ Descripcion: err.message, Error: err })
    }

})

//Ruta para actualizar datos. Se hizo con POST porque el atributo "method" de HTML solo permite GET/POST
app.post("/actualizar", async (req, res) => {
    const datos = req.body
    try {
        await actualizarParticipante(datos)
        res.redirect("/")
    } catch (err) {
        res.status(500).send({ Descripcion: err.message, Error: err })
    }
})

//Ruta para eliminar un usuario
app.delete("/eliminar", async (req, res) => {
    const { email } = req.query
    const participantesData = await getParticipantes()
    const participantes = participantesData.rows
    const usuario = participantes.find(participante => participante.email == email)
    try {
        //Eliminación de foto almacenada, correspondiente al participante 
        await eliminarParticipante(email)
        await fs.unlink(`${__dirname}/public/uploads/${usuario.foto}`, (error) => {
            console.log(`No se ha podido eliminar la imagen asociada al usuario: ${email}`)
        })
        return res.redirect("/")
    } catch (err) {
        res.status(500).send({ Descripcion: err.message, Error: err })
    }
})

app.put("/estados", async (req, res) => {
    const estados = req.body
    try {
        await estados.forEach(estado => {
            actualizarEstado(estado)    
        });
        res.redirect("/")
    } catch (error) {
        res.status(500).send({ Descripcion: err.message, Error: err })
    }
})