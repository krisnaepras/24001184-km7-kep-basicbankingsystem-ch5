const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = process.env;

const restrict = async (req, res, next) => {
    const { authorization } = req.headers;
    if(!authorization){
        return res.status(401).json({ error: "You must be logged in to access this route" });
    }
    jwt.verify(authorization, JWT_SECRET_KEY, (err, decoded) => {
        if(err){
            return res.status(403).json({ error: "You are not authoried" });
        }
        req.user = decoded;
        next();
    });
};

module.exports = restrict;
