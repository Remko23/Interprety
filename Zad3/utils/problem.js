function problem(res, status, title, detail, type = 'about:blank') {
    return res.status(status).json({
        type,
        title,
        status,
        detail,
        instance: res.req.originalUrl
    });
}

module.exports = {
    problem
};