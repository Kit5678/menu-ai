import { PrismaClient } from '@prisma/client'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'sample_recipes.json')
  const raw = await readFile(dataPath, 'utf-8')
  const parsed = JSON.parse(raw)
  const recipes = parsed.recipes || []

  await prisma.recipe.deleteMany()

  if (recipes.length > 0) {
    await prisma.recipe.createMany({
      data: recipes.map((recipe) => ({
        name_en: recipe.name_en,
        name_th: recipe.name_th,
        ingredients_en: recipe.ingredients_en || [],
        ingredients_th: recipe.ingredients_th || [],
        seasonings_en: recipe.seasonings_en || [],
        seasonings_th: recipe.seasonings_th || [],
        time_min: recipe.time_min ?? null,
        difficulty: recipe.difficulty ?? null,
        steps_en: recipe.steps_en || [],
        steps_th: recipe.steps_th || [],
        ai_reason: recipe.ai_reason || null
      }))
    })
  }

  console.log(`Seeded ${recipes.length} recipes`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
