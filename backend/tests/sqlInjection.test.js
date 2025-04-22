import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('SQL Injection Protection Tests', () => {
    const injectionAttempts = [
        "' OR '1'='1",
        "1 OR 1=1",
        "'; DROP TABLE users; --",
        "' UNION SELECT username, password FROM users --",
        "admin'--"
    ];

    describe('Login Endpoint Protection', () => {
        injectionAttempts.forEach(injection => {
            it(`should prevent SQL injection: ${injection}`, async () => {
                const response = await request(app)
                    .post('/api/auth/login')
                    .send({
                        username: injection,
                        password: injection
                    });
                
                expect(response.status).to.not.equal(200);
                expect(response.body).to.not.have.property('token');
            });
        });
    });

    describe('Products Endpoint Protection', () => {
        injectionAttempts.forEach(injection => {
            it(`should prevent SQL injection in product search: ${injection}`, async () => {
                const response = await request(app)
                    .get(`/api/products?name=${injection}`);
                
                // La validación de SQL injection debe ocurrir antes de la autenticación
                expect(response.status).to.equal(400);
                expect(response.body).to.have.property('error');
            });
        });
    });
});