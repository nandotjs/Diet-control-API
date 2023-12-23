import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Users routes', () => {

    beforeAll(async () => await app.ready())
    afterAll(async () => await app.close())
    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })
    
    

    it('should be able to create a user', async () => {
    
        await request(app.server)
        .post('/user')
        .send({
            name: 'Test name',
            email: 'example@example.com'
        })
        .expect(201)
    
    })

    it('should be able to get user details', async () => {
    
        const createResponse = await request(app.server)
        .post('/user')
        .send({
            name: 'Test name',
            email: 'example@example.com'
        })

        const cookies = createResponse.get('Set-Cookie')
        
        const userDetails = await request(app.server)
        .get('/user/details')
        .set('Cookie', cookies)
        .expect(200)

        console.log(userDetails.body)
    })
    
})