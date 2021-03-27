exports.ensureLogin = (req,res,next) => {
    if(req.isAuthenticated()) next();
    else throw new Error('Please Login');
}

exports.ensureNoLogin = (req,res,next) => {
    if(req.isAuthenticated()) throw new Error('Please logout');
    next();
}