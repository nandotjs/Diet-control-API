import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from "crypto"
import { checkSessionIdExists } from "../middleware/check-session-id-exists"

export async function mealRoutes(app: FastifyInstance) {

    app.addHook('preHandler', async (req) => {
        console.log(`[${req.method}] ${req.url}`)
    })

    // Create meal
    app.post('/', {preHandler: [checkSessionIdExists]}, async (req, rep) => {
        
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            is_on_diet: z.boolean()
        })
        const { name, description, is_on_diet } = createMealBodySchema.parse(req.body)
        
        try {
            const meal = await knex('meals').insert({
                id: randomUUID(),
                name,
                description,
                is_on_diet,
                user_id: req.user?.id
            });

            console.log('201 Created')

            return rep.status(201).send('Created');
        } catch (error) {
            console.error('Cant create meal:', error);
            return rep.status(500).send({ error });
        }

        
    })
}
