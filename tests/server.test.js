const request = require('supertest');
const app = require('../src/app');
const fs = require('fs');
const path = require('path');

let data, data1, data2;

beforeEach(() => {
    console.log(path.resolve(__dirname, "./sampleRequest.txt"));

    data1 = fs.readFileSync(path.resolve(__dirname, "./sampleRequest1.txt"), 'utf8');
    data2 = fs.readFileSync(path.resolve(__dirname, "./sampleRequest2.txt"), 'utf8');
})

test('Request to the server that should be accepted', async () => {
    await request(app)
    .post('/layout/graphml')
    .expect(200)
    .send(data1)
    .set('Accept', 'text/plain')
    .set('Content-Type', 'json');
})

test("Request to the server without body that shouldn't be accepted", async () => {
    await request(app)
    .post('/layout/graphml')
    .expect(500)
    .set('Accept', 'text/plain')
    .set('Content-Type', 'json');
})

test("Request to the server with correct file format that should be accepted", async() => {
    await request(app)
    .post('/layout/json')
    .expect(200)
    .send(data2)
    .set('Accept', 'text/plain')
    .set('Content-Type', 'json');
})

test("Request to the server with wrong file format that should not be accepted", async() => {
    await request(app)
    .post('/layout/sbgnml')
    .expect(500)
    .send(data2)
    .set('Accept', 'text/plain')
    .set('Content-Type', 'json');
})
