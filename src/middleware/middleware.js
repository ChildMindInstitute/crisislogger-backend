import JWT from 'jsonwebtoken';
import {ADMIN_ROLE} from '../constants'

const  checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    let where_from = req.headers.origin.split('//')[1];
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }
    if (token) {
        JWT.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Token is not valid'
                });
            } else {
                if(decoded.host === where_from){
                    req.decoded = decoded;
                    next();
                }else {
                    return res.json({
                        success: false,
                        message: 'Not Authorized'
                    });
                }
            }
        });
    } else {
        return res.json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
};
const checkAdmin = (req,res,next)=>{
    if(req.decoded.role === ADMIN_ROLE){
        next()
    }else{
        return res.json({
            success: false,
            message: 'User not authorized'
        });
    }
}

export {
    checkToken,
    checkAdmin
}