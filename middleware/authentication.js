exports.ensureLogin = (req,res,next) => {
    if(req.isAuthenticated()) next();
    else res.redirect('/');
}

exports.ensureNoLogin = (req,res,next) => {
    if(req.isAuthenticated()) throw new Error('Please logout');
    next();
}