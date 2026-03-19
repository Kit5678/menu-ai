import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = express()
const prisma = new PrismaClient()

const defaultOrigins = [
  'http://localhost:5173',
  'https://menu-ai-tan.vercel.app',
  'https://menu-ai-git-main-kit5678s-projects.vercel.app',
  'https://menu-nhiwxpcp8-kit5678s-projects.vercel.app',
  'https://menu-3jagyvn97-kit5678s-projects.vercel.app'
]

const envOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean)
  : []

const allowOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]))

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('CORS not allowed'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  })
)

app.use(express.json({ limit: '1mb' }))

const INGREDIENT_ALIASES = {
  'ไข่': 'egg',
  'กระเทียม': 'garlic',
  'ข้าว': 'rice',
  'ไก่': 'chicken',
  'โหระพา': 'basil',
  'กะเพรา': 'basil',
  'พริก': 'chili',
  'เส้นก๋วยเตี๋ยว': 'noodles',
  'ถั่วงอก': 'bean sprouts',
  'หมู': 'pork',
  'คะน้า': 'kale',
  'น้ำมัน': 'oil',
  'ซีอิ๊ว': 'soy sauce',
  'หอมใหญ่': 'onion',
  'มะเขือเทศ': 'tomato',
  'เกลือ': 'salt',
  'กุ้ง': 'shrimp',
  'ตะไคร้': 'lemongrass',
  'มะนาว': 'lime',
  'น้ำปลา': 'fish sauce',
  'เนื้อวัว': 'beef',
  'เต้าหู้': 'tofu',
  'ปลาหมึก': 'squid',
  'ปลาทู': 'mackerel',
  'เบคอน': 'bacon',
  'แฮม': 'ham',
  'มันฝรั่ง': 'potato',
  'ผักบุ้ง': 'morning glory',
  'กะหล่ำปลี': 'cabbage',
  'แครอท': 'carrot',
  'พริกหวาน': 'bell pepper',
  'เห็ด': 'mushroom',
  'วุ้นเส้น': 'vermicelli',
  'ขนมปัง': 'bread',
  'ขิง': 'ginger',
  'ใบมะกรูด': 'kaffir lime leaves',
  'ข่า': 'galangal',
  'ต้นหอม': 'spring onion',
  'ผักชี': 'coriander',
  'พริกไทย': 'pepper',
  'ซอสหอยนางรม': 'oyster sauce',
  'น้ำตาล': 'sugar',
  'น้ำมันหอย': 'oyster sauce',
  'ซีอิ๊วขาว': 'light soy sauce',
  'ซีอิ๊วดำ': 'dark soy sauce',
  'ซอสมะเขือเทศ': 'ketchup',
  'ซอสพริก': 'chili sauce',
  'น้ำมันงา': 'sesame oil',
  'น้ำส้มสายชู': 'vinegar',
  'พริกป่น': 'chili flakes',
  'กะทิ': 'coconut milk',
  'กะปิ': 'shrimp paste',
  'ปลาร้า': 'fermented fish',
  'ไก่บด': 'ground chicken',
  'หมูบด': 'ground pork',
  'หอยแครง': 'blood cockle',
  'กุ้งแห้ง': 'dried shrimp',
  'ถั่วฝักยาว': 'yardlong beans',
  'ข้าวโพด': 'corn',
  'ฟักทอง': 'pumpkin',
  'แตงกวา': 'cucumber',
  'แตงกวาดอง': 'pickled cucumber',
  'มะเขือยาว': 'eggplant',
  'มะเขือเปราะ': 'thai eggplant',
  'ใบโหระพา': 'basil',
  'ใบกะเพรา': 'basil',
  'ใบสะระแหน่': 'mint'
}

const normalize = (items = []) =>
  items
    .map((item) => String(item).trim().toLowerCase())
    .filter((item) => item.length > 0)

const toCanonical = (items = []) =>
  normalize(items).map((item) => INGREDIENT_ALIASES[item] || item)

const fallbackReason = (lang, matched) => {
  if (lang === 'th') {
    if (matched.length > 0) {
      return `วัตถุดิบตรงกัน ${matched.length} รายการ เหมาะสำหรับทำเมนูนี้`
    }
    return 'เมนูนี้ยังขาดวัตถุดิบบางส่วน แต่สามารถปรับได้'
  }
  if (matched.length > 0) {
    return `${matched.length} ingredients match. This recipe is a good fit.`
  }
  return 'Some ingredients are missing, but it can be adapted.'
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/recommend', async (req, res) => {
  const ingredients = Array.isArray(req.body?.ingredients) ? req.body.ingredients : []
  const language = req.body?.language === 'en' ? 'en' : 'th'

  const recipes = await prisma.recipe.findMany()
  const userCanon = new Set(toCanonical(ingredients))

  const scored = recipes.map((recipe) => {
    const recipeCanon = new Set(toCanonical(recipe.ingredients_en))
    const overlap = [...recipeCanon].filter((item) => userCanon.has(item))
    const score = Math.round((overlap.length / (recipeCanon.size || 1)) * 10)

    const matched = []
    for (const original of ingredients) {
      const canon = toCanonical([original])[0]
      if (canon && recipeCanon.has(canon)) {
        matched.push(original)
      }
    }

    const displayMapTh = {}
    const displayMapEn = {}
    recipe.ingredients_en.forEach((enItem, idx) => {
      const canon = toCanonical([enItem])[0]
      const thItem = recipe.ingredients_th[idx] || enItem
      displayMapTh[canon] = thItem
      displayMapEn[canon] = enItem
    })

    const missingCanon = [...recipeCanon].filter((item) => !overlap.includes(item))
    const missing_th = missingCanon.map((item) => displayMapTh[item] || item).slice(0, 3)
    const missing_en = missingCanon.map((item) => displayMapEn[item] || item).slice(0, 3)

    return {
      id: recipe.id,
      name_en: recipe.name_en,
      name_th: recipe.name_th,
      ingredients_en: recipe.ingredients_en,
      ingredients_th: recipe.ingredients_th,
      seasonings_en: recipe.seasonings_en,
      seasonings_th: recipe.seasonings_th,
      score,
      matched: [...new Set(matched)],
      missing_en,
      missing_th,
      ai_reason: recipe.ai_reason || fallbackReason(language, matched),
      ai_missing: language === 'th' ? missing_th : missing_en,
      ai_substitutes: [],
      time_min: recipe.time_min,
      difficulty: recipe.difficulty,
      steps_en: recipe.steps_en,
      steps_th: recipe.steps_th
    }
  })

  scored.sort((a, b) => b.score - a.score)
  res.json({ input: ingredients, language, results: scored.slice(0, 5) })
})

const port = process.env.PORT || 8000
app.listen(port, () => {
  console.log(`API running on port ${port}`)
})
