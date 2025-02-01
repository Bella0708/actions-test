const request = require('supertest');
const server = require('../app.js');

describe('GET /', () => {
    it('should return Hello, World!', (done) => {
        request(server)
            .get('/')
            .expect('Content-Type', /text\/plain/)
            .expect(200)
            .expect('Hello, World!\n', done);
    });

    it('should return status code 200', (done) => {
        request(server)
            .get('/')
            .expect(200, done);
    });
});

