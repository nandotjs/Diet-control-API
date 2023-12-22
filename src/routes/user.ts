import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from "crypto"

export async function userRoutes(app: FastifyInstance) {

    app.addHook('preHandler', async (req) => {
        console.log(`[${req.method}] ${req.url}`)
    })

    // Create user
    app.post('/', async (req, rep) => {
        
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
        })
        
    
        // cookies
        let sessionId = req.cookies.sessionID
        
        if (!sessionId) {
            sessionId = randomUUID()
            
            rep.cookie('sessionID', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7   // 7 days
            })
        }

        const { name, email } = createUserBodySchema.parse(req.body)

        const userByEmail = await knex('users').where({ email }).first()

        if (userByEmail) {
            return rep.status(400).send({ message: 'User already exists' })
        }
        
        try {
            await knex('users').insert({
                id: randomUUID(),
                session_id: sessionId,
                name,
                email
            });

            console.log('201 Created')
            console.log({sessionId})

            return rep.status(201).send('Created');
        } catch (error) {
            console.error('Cant create user:', error);
            return rep.status(500).send({ error });
        }

        
    })
}