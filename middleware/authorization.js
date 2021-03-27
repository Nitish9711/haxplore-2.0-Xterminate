exports.ensureClient = (req,res,next) => {
    if(req.user.clientCount === undefined) next();
    else throw new Error('Please login as a client');
}

exports.ensureLawyer = (req,res,next) => {
    if(req.user.clientCount !== undefined) next();
    else throw new Error('Please login as a lawyer');
}

exports.identifyUserType = (req,res,next) => {
    if(req.user){
        if(!req.find) req.find = {};
        if(req.user.clientCount === undefined) req.find.type = 'client';
        else req.find.type = 'lawyer';
    }
    next();
}