const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'default_secret_key';
const REFRESH_SECRET_KEY = 'default_refresh_secret_key';

const TOKEN_EXPIRATION = '1h'; 
const REFRESH_TOKEN_EXPIRATION = '7d';

function generateTokens(user) {
    const payload = { 
        id: user.get('id'), 
        login: user.get('login'), 
        role: user.get('role')
    };

    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
    const refreshToken = jwt.sign({ id: user.get('id') }, REFRESH_SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRATION });
    
    return { accessToken, refreshToken };
}

exports.login = async (req, res) => {
    const { login, password } = req.body; 

    if (!login || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Login i hasło są wymagane." });
    }

    try {
        const user = await User.getByLogin(login); 

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Nieprawidłowe dane uwierzytelniające." });
        }

        user.comparePassword(password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Nieprawidłowe dane uwierzytelniające." });
            }

            const { accessToken, refreshToken } = generateTokens(user);

            res.status(StatusCodes.OK).json({ 
                message: "Zalogowano pomyślnie.",
                user: { id: user.get('id'), login: user.get('login'), role: user.get('role') },
                accessToken,
                refreshToken
            });
        });

    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Błąd serwera podczas logowania.' });
    }
};

exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Refresh Token jest wymagany.' });
    }

    jwt.verify(refreshToken, REFRESH_SECRET_KEY, async (err, decoded) => {
        if (err) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Nieprawidłowy lub wygasły Refresh Token.' });
        }

        try {
            const user = await new User({ id: decoded.id }).fetch();

            if (!user) {
                return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Użytkownik nie istnieje.' });
            }

            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

            res.status(StatusCodes.OK).json({ 
                message: "Token odświeżony pomyślnie.",
                accessToken,
                refreshToken: newRefreshToken
            });

        } catch (error) {
            console.error(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Błąd serwera podczas odświeżania tokenu.' });
        }
    });
};