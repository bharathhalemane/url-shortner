const MAX_LENGTH = 2048;

const validateUrl = (input) => {
    if (typeof input !== 'string' || input.length === 0 || input.length > MAX_LENGTH) {
        return null;
    }
    
    try {
        const u = new URL(input);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
        return u.toString();
    }catch(err){
        console.log(err);
        return null;
    }
};

module.exports = validateUrl