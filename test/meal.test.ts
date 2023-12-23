import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Meals routes', () => {

    beforeAll(async () => await app.ready())
    afterAll(async () => await app.close())
    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })
    
    it('should be able to create a meal', async () => {
    
        const userResponse = await request(app.server)
        .post('/user')
        .send({
            name: 'Test name',
            email: 'example@example.com'
        })

        const cookies = userResponse.get('Set-Cookie')
        
        const mealResponse = await request(app.server)
        .post('/meal')
        .set('Cookie', cookies)
        .send({
            name: 'Test name',
            description: 'example',
            is_on_diet: true
        })
        .expect(201)

    })

    it('should be able to list all meals', async () => {
    
        const userResponse = await request(app.server)
        .post('/user')
        .send({
            name: 'Test name',
            email: 'example@example.com'
        })

        const cookies = userResponse.get('Set-Cookie')
        
        await request(app.server)
        .post('/meal')
        .set('Cookie', cookies)
        .send({
            name: 'Test name',
            description: 'example',
            is_on_diet: true
        })

        const listResponse = await request(app.server)
        .get('/meal')
        .set('Cookie', cookies)
        .expect(200)

        
        expect(listResponse.body.meals).toEqual([
            expect.objectContaining({
                name: 'Test name',
            description: 'example',
            is_on_diet: '1'
            })
        ])
    
    })

    it('should be able to get a specific meal', async () => {
    
        const userResponse = await request(app.server)
        .post('/user')
        .send({
            name: 'Test name',
            email: 'example@example.com'
        })

        const cookies = userResponse.get('Set-Cookie')
        
        await request(app.server)
        .post('/meal')
        .set('Cookie', cookies)
        .send({
            name: 'Test name',
            description: 'example',
            is_on_diet: true
        })

        const listResponse = await request(app.server)
        .get('/meal')
        .set('Cookie', cookies)
        .expect(200)

        const mealId = listResponse.body.meals[0].id

        const getResponse = await request(app.server)
        .get(`/meal/${mealId}`)
        .set('Cookie', cookies)
        .expect(200)
        
        expect(getResponse.body.meal).toEqual(
            expect.objectContaining({
                name: 'Test name',
                description: 'example',
                is_on_diet: '1'
            })
        )
    
    })

    it('should be able to delete a specific meal', async () => {
    
        const userResponse = await request(app.server)
        .post('/user')
        .send({
            name: 'Test name',
            email: 'example@example.com'
        })

        const cookies = userResponse.get('Set-Cookie')
        
        await request(app.server)
        .post('/meal')
        .set('Cookie', cookies)
        .send({
            name: 'Test name',
            description: 'example',
            is_on_diet: true
        })
        .expect(201)

        const mealResponse = await request(app.server)
        .get('/meal')
        .set('Cookie', cookies)
        .expect(200)

        const mealId = mealResponse.body.meals[0].id

        const deleteResponse = await request(app.server)
        .delete(`/meal/${mealId}`)
        .set('Cookie', cookies)
        .expect(204)

        expect(deleteResponse.body).toEqual({})
    })

})