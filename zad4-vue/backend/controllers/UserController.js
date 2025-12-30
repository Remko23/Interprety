const User = require('../models/user');
const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { problem } = require('../utils/problem')

const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

const TOKEN_EXPIRATION = process.env.TOKEN_EXP;
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXP;

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
        return problem(res, StatusCodes.BAD_REQUEST, 'Nieprawidłowe żądanie', "Login i hasło są wymagane.", '/missing-credentials');
    }

    try {
        const user = await User.getByLogin(login);

        if (!user) {
            return problem(res, StatusCodes.UNAUTHORIZED, 'Błąd autoryzacji', "Nieprawidłowe dane uwierzytelniające.", '/invalid-credentials');
        }

        user.comparePassword(password, (err, isMatch) => {
            if (err || !isMatch) {
                return problem(res, StatusCodes.UNAUTHORIZED, 'Błąd autoryzacji', "Nieprawidłowe dane uwierzytelniające.", '/invalid-credentials');
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
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas logowania.');
    }
};

exports.register = async (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return problem(res, StatusCodes.BAD_REQUEST, 'Błąd walidacji', 'Login i hasło są wymagane.', '/validation-error');
    }

    try {
        const existingUser = await new User({ login }).fetch({ require: false });
        if (existingUser) {
            return problem(res, StatusCodes.CONFLICT, 'Duplikat', 'Użytkownik o takiej nazwie już istnieje.', '/user-exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await new User({ login, password: hashedPassword, role: 'KLIENT' }).save();

        res.status(StatusCodes.CREATED).json({ message: 'Rejestracja zakończona sukcesem. Możesz się teraz zalogować.' });
    } catch (err) {
        console.error(err);
        return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas rejestracji.', '/server-error');
    }
};

exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return problem(res, StatusCodes.BAD_REQUEST, 'Nieprawidłowe żądanie', 'Refresh Token jest wymagany.', '/missing-token');
    }

    jwt.verify(refreshToken, REFRESH_SECRET_KEY, async (err, decoded) => {
        if (err) {
            return problem(res, StatusCodes.FORBIDDEN, 'Odmowa dostępu', 'Nieprawidłowy lub wygasły Refresh Token.', '/expired-token');
        }

        try {
            const user = await new User({ id: decoded.id }).fetch();

            if (!user) {
                return problem(res, StatusCodes.UNAUTHORIZED, 'Błąd autoryzacji', 'Użytkownik nie istnieje.', '/user-not-found');
            }

            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

            res.status(StatusCodes.OK).json({
                message: "Token odświeżony pomyślnie.",
                accessToken,
                refreshToken: newRefreshToken
            });

        } catch (error) {
            console.error(error);
            return problem(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Błąd serwera', 'Wystąpił błąd serwera podczas odświeżania tokenu.');
        }
    });
};