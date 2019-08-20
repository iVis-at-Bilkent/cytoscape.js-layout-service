const request = require('supertest');
const app = require('../src/app');
const fs = require('fs');

// let requestOne = require('./sampleRequest.txt');



test('Sample test', async () => {
    let file;
    try {
        await fs.readFile('./tests/sampleRequest.txt', async (error, data) => {
            if (error)
                console.log(error);

            data = data.toString();

            try {
                await request(app)
                    .post('/layout/graphml')
                    .send(data)
                    .set('Content-Type', 'text/plain')
                    .expect(200)
                    .end((err, res) => {
                        if (err) throw err;

                        console.log(res);
                    })
            }
            catch (e) {
                console.log(e);
            }

        });
    }
    catch (e) {
        console.log(e);
    }
})
