const  express = require('express');
const routes = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
if(process.env.NODE_ENV != 'production')
{
    require('dotenv').config();
}




routes.post('/login',(req,res)=>{
    const user= req.body['usuario']
    const pass =req.body['password']
    req.getConnection((err,conn)=>{
        if(err) return res.send(err)
        conn.query('SELECT * FROM users WHERE email = ?',[user], async (err,rows)=>{
            if(err) return res.send(err)
            if(rows.length == 0 ||  !( await bcrypt.compare(pass,rows[0].password))  ){
                res.status(403).json(err)
            }
            else{
                const user = {"name": rows[0].nickname, "password":pass}
                const perfil = {"name":rows[0].name, "email": rows[0].email, "user": rows[0].nickname}
                const token = jwt.sign({user},process.env.TOKEN_KEY,{expiresIn: '1h'});
                res.status(200).json({token,perfil});
            }
        })
    })
    
    
})

function verifyToken(req, res, next){


    const beareHeader =   req.headers['authorization']
        if (typeof beareHeader !== 'undefined') {
            const bearerToken=   beareHeader.split(" ")[1];
            req.token = bearerToken;
            next();
        }
        else{
            res.sendStatus(403);
        }
}

routes.post('/paises',verifyToken,(req,res)=>{
    jwt.verify(req.token, process.env.TOKEN_KEY,(error, authData)=>{
        if (error) {
            
            res.sendStatus(403);
        }else{
            req.getConnection( (err,conn)=>{
                if(err) return res.send(err)
                conn.query('SELECT desc_pais as pais,cod_pais FROM pais WHERE id_pais <> 5' , (err,rows)=>{
                    if(err) return res.send(err)
                    res.json(rows)
                })
            })
        }

    })

   
})

routes.post('/modulos/:codigo',verifyToken,(req,res)=>{
    req.getConnection((err,conn)=>{
        if(err) return res.send(err)
        conn.query('CALL pa_asig_mod(?)', [req.params.codigo], (err,rows)=>{
            if(err) return res.send(err)
          
            res.json(rows[0]    )
        })
    })
})


routes.post('/dashboard',verifyToken,(req,res)=>{
    req.getConnection((err,conn)=>{
        if(err) return res.send(err)

        conn.query('CALL pa_consultar_modulo(?,?,?,?)', [req.body.pais,req.body.cargo,req.body.depto,req.body.muni], (err,rows)=>{
            if(err) return res.send(err)
     
            res.json(rows )
        })
    })
})


routes.post('/get-muni',verifyToken,(req,res)=>{
    req.getConnection((err,conn)=>{
        if(err) return res.send(err)

        conn.query('SELECT desc_municipio label, id_municipio value FROM municipios where id_departamento = ?', [req.body.depto], (err,rows)=>{
            if(err) return res.send(err)
            res.json(rows )
        })
    })
})






// routes.get('/dashboard/:pais/:cargo',(req,res)=>{
//     req.getConnection((err,conn)=>{
//         if(err) return res.send(err)
//         conn.query('CALL pa_consultar_modulo(?,?)', [req.params.pais,req.params.cargo], (err,rows)=>{
//             if(err) return res.send(err)
//             res.json(rows[0]    )
//         })
//     })
// })
// routes.delete('/:id',(req,res)=>{
//     req.getConnection((err,conn)=>{
//         if(err) return res.send(err)
//         conn.query('DELETE FROM books WHERE ID = ?', [req.params.id],  (err,rows)=>{
//             if(err) return res.send(err)
//             res.send('book deleted')
//         })
//     })
// })


// routes.put('/:id',(req,res)=>{
//     req.getConnection((err,conn)=>{
//         if(err) return res.send(err)
//         conn.query('UPDATE books set ? WHERE id = ?',[req.body, req.params.id],  (err,rows)=>{
//             if(err) return res.send(err)
//             res.send('book updated')
//         })
//     })
// })




module.exports = routes