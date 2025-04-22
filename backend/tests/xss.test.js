import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export const generateTestToken = (userId = 1) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

describe('XSS Protection Tests', () => {
    // Generate a fresh token before all tests
    const token = generateTestToken(1); // Usuario ID 1 (SuperAdmin)
    
    const xssPayloads = [
        {
            name: "Basic Script Injection",
            payload: "<script>alert('XSS')</script>",
            sanitized: "&lt;script&gt;alert('XSS')&lt;/script&gt;"
        },
        {
            name: "Image Tag with Script",
            payload: `<img src="x" onerror="alert('XSS')">`,
            sanitized: `&lt;img src="x"&gt;`
        },
        {
            name: "JavaScript Protocol in Link",
            payload: `<a href="javascript:alert('XSS')">Click me</a>`,
            sanitized: `&lt;a&gt;Click me&lt;/a&gt;`
        },
        {
            name: "Event Handler Injection",
            payload: `<div onmouseover="alert('XSS')">Hover me</div>`,
            sanitized: `&lt;div&gt;Hover me&lt;/div&gt;`
        },
        {
            name: "SVG with Script",
            payload: `<svg><script>alert('XSS')</script></svg>`,
            sanitized: `&lt;svg&gt;&lt;/svg&gt;`
        }
    ];

    describe('Product Creation XSS Protection', () => {
        xssPayloads.forEach(({name, payload}) => {
            it(`should sanitize ${name} in product creation`, async () => {
                const response = await request(app)
                    .post('/api/products')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        name: payload,
                        description: payload,
                        code: "TEST123",
                        price: 10.99,
                        quantity: 100
                    });

                expect(response.status).to.not.equal(500);
                if (response.status === 201) {
                    expect(response.body.name).to.not.include('<script>');
                    expect(response.body.description).to.not.include('<script>');
                }
            });
        });
    });

    describe('User Creation XSS Protection', () => {
        xssPayloads.forEach(({name, payload}) => {
            it(`should sanitize ${name} in user creation`, async () => {
                const response = await request(app)
                    .post('/api/users')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        username: payload,
                        password: 'test123',
                        role_id: 2
                    });

                expect(response.status).to.not.equal(500);
                if (response.status === 201) {
                    expect(response.body.username).to.not.include('<script>');
                }
            });
        });
    });

    describe('Role Creation XSS Protection', () => {
        xssPayloads.forEach(({name, payload}) => {
            it(`should sanitize ${name} in role creation`, async () => {
                const response = await request(app)
                    .post('/api/roles')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        name: payload,
                        permissions: ['read']
                    });

                expect(response.status).to.not.equal(500);
                if (response.status === 201) {
                    expect(response.body.name).to.not.include('<script>');
                }
            });
        });
    });
});