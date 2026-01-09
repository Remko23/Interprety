function problem(res, status, title, detail, type = 'about:blank') {
    const url = "http://localhost:2323/probs"
    if (type != 'about:blank') {
        type = url + type;
    }
    return res.status(status).set('Content-Type', 'application/problem+json').json({
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