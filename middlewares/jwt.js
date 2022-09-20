var jwt = require('jsonwebtoken');

// defino una función "middleware" para validar sesiones
exports.validateJWT = (req, res, next) => {
    // obtengo el token que se envía por header
    const token = req.headers['auth-token']
    if(!token){
        // si no se envió ningun token entonces retorno error
        return res.status(401).json({ success: false, message:"no token found in auth-token header" })
    }

    // verifico el token enviado por header
    jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decode) => {
        // si existe algún tipo de error entonces retorno error
        if(err){
            return res.status(401).json({ success: false, message:"invalid token" })
        }
        console.log(decode)
        // realizo cálculos de tiempo para validar token expirado
        const tiempo = decode.iat
        var ahora = new Date()
        var tokenfecha = new Date(tiempo * 1000)
        var dif = (ahora.getTime() - tokenfecha.getTime()) / 1000
        // si hace más de 30 segundos que se generó el token (que se hizo login) entonces asumo que la sesión expiró
        if(dif > 60){
            // si el token expiró entonces retorno error
            return res.status(401).json({ success: false, message:"token expirado" })
        }
        //req.usuario = decode.email // puedo agregar información a la request
        next()
    })
}