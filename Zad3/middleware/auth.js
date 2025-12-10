const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { problem } = require('../utils/problem');

const SECRET_KEY = process.env.SECRET_KEY;

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return problem(res, StatusCodes.UNAUTHORIZED, 'Unathorized', 'Brak tokenu dostępu.', 'http://localhost:2323/probs/no-token');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return problem(res, StatusCodes.UNAUTHORIZED, 'Invalid authorization header', 'Błędny format tokenu dostępu (wymagany Bearer token).', 'http://localhost:2323/probs/bad-format');
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return problem(res, StatusCodes.FORBIDDEN, 'Invalid or Expired Token', 'Token jest nieprawidłowy lub wygasł.', 'http://localhost:2323/probs/invalid-token');
        }

        req.user = decoded;
        next();
    });
};

exports.checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return problem(res, StatusCodes.FORBIDDEN, 'Missing Role', 'Brak informacji o roli użytkownika.', 'http://localhost:2323/probs/no-role');
        }
        if (allowedRoles.includes(req.user.role)) {
            next();
        } else {
            return problem(res, StatusCodes.FORBIDDEN, 'No Permission', 'Brak uprawnień do wykonania tej operacji.', 'http://localhost:2323/probs/forbidden');
        }
    };
};