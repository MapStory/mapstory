function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

if(process.env.TRAVIS) {
    define("baseURL", 'https://localhost');
} else {
    define("baseURL", "http://192.168.56.151")
}
