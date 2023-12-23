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
    app.post('/', { preHandler: [checkSessionIdExists] }, async (req, rep) => {

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        is_on_diet: z.boolean(),
      })

      const { name, description, is_on_diet } = createMealBodySchema.parse(
        req.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        is_on_diet,
        user_id: req.user?.id,
      })

      return rep.status(201).send('Meal created')
    })
    
    // List meals
    app.get('/', {preHandler: [checkSessionIdExists]}, async (req, rep) => {
      
      const meals = await knex('meals')
      .where('user_id', req.user?.id)
      .select('*')

      return {meals}
    })

    // Get especific meal
    app.get('/:id', {preHandler: [checkSessionIdExists]}, async (req, rep) => {
      
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(req.params)
      
      const meal = await knex('meals')
      .where('id', id)
      .first()

      return { meal }
    })

    // Delete especific meal
    app.delete('/:mealId', {preHandler: [checkSessionIdExists]}, async (req, rep) => {

      const paramsSchema = z.object({ mealId: z.string().uuid() })

      const { mealId } = paramsSchema.parse(req.params)

      const meal = await knex('meals').where({ id: mealId }).first()

      if (!meal) {
        return rep.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals').where({ id: mealId }).delete()

      return rep.status(204).send('Deleted')
    })
}
