const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const SECRET_KEY = process.env.JWT_SECRET_KEY;

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Brak tokenu dostępu.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Błędny format tokenu dostępu (wymagany Bearer token).' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Token jest nieprawidłowy lub wygasł.' });
        }

        req.user = decoded;
        next();
    });
};

exports.checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Brak informacji o roli użytkownika.' });
        }
        if (allowedRoles.includes(req.user.role)) {
            next();
        } else {
            res.status(StatusCodes.FORBIDDEN).json({ message: 'Brak uprawnień do wykonania tej operacji.' });
        }
    };
};