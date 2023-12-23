import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from "crypto"
import { checkSessionIdExists } from "../middleware/check-session-id-exists"

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

            return rep.status(201).send('User created')
        } catch (error) {
            console.error('Cant create user:', error)
            return rep.status(500).send({ error })
        }

        
    })

    // User details
    app.get('/details', { preHandler: [checkSessionIdExists] }, async (req, rep) => {
        
        const totalMealsOnDiet = await knex('meals')
        .where({ user_id: req.user?.id, is_on_diet: true })
        .count('id', { as: 'total' })
        .first()

        const totalMealsOffDiet = await knex('meals')
        .where({ user_id: req.user?.id, is_on_diet: false })
        .count('id', { as: 'total' })
        .first()

        const totalMeals = await knex('meals')
        .where({ user_id: req.user?.id })
        .count('id', { as: 'total' })
        .first()

        return rep.send({
            totalMeals,
            totalMealsOnDiet,
            totalMealsOffDiet
        })
    })

}