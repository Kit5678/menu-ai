import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = express()
const prisma = new PrismaClient()

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://menu-ai-tan.vercel.app',
  'https://menu-ai-git-main-kit5678s-projects.vercel.app',
  'https://menu-nhiwxpcp8-kit5678s-projects.vercel.app',
  'https://menu-3jagyvn97-kit5678s-projects.vercel.app'
]

const envOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean)
  : []

const allowOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]))

const isAllowedOrigin = (origin) => {
  if (!origin) return true
  if (allowOrigins.includes(origin)) return true
  try {
    const url = new URL(origin)
    if (url.hostname.endsWith('.vercel.app')) return true
  } catch (err) {
    return false
  }
  return false
}

app.use(
  cors({
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  })
)

app.use(express.json({ limit: '1mb' }))

const INGREDIENT_ALIASES = {
  '\u0e44\u0e02\u0e48': 'egg',
  '\u0e01\u0e23\u0e30\u0e40\u0e17\u0e35\u0e22\u0e21': 'garlic',
  '\u0e02\u0e49\u0e32\u0e27': 'rice',
  '\u0e44\u0e01\u0e48': 'chicken',
  '\u0e42\u0e2b\u0e23\u0e30\u0e1e\u0e32': 'basil',
  '\u0e01\u0e30\u0e40\u0e1e\u0e23\u0e32': 'basil',
  '\u0e1e\u0e23\u0e34\u0e01': 'chili',
  '\u0e40\u0e2a\u0e49\u0e19\u0e01\u0e4b\u0e27\u0e22\u0e40\u0e15\u0e35\u0e4b\u0e22\u0e27': 'noodles',
  '\u0e16\u0e31\u0e48\u0e27\u0e07\u0e2d\u0e01': 'bean sprouts',
  '\u0e2b\u0e21\u0e39': 'pork',
  '\u0e04\u0e30\u0e19\u0e49\u0e32': 'kale',
  '\u0e19\u0e49\u0e33\u0e21\u0e31\u0e19': 'oil',
  '\u0e0b\u0e35\u0e2d\u0e34\u0e4a\u0e27': 'soy sauce',
  '\u0e2b\u0e2d\u0e21\u0e43\u0e2b\u0e0d\u0e48': 'onion',
  '\u0e21\u0e30\u0e40\u0e02\u0e37\u0e2d\u0e40\u0e17\u0e28': 'tomato',
  '\u0e40\u0e01\u0e25\u0e37\u0e2d': 'salt',
  '\u0e01\u0e38\u0e49\u0e07': 'shrimp',
  '\u0e15\u0e30\u0e44\u0e04\u0e23\u0e49': 'lemongrass',
  '\u0e21\u0e30\u0e19\u0e32\u0e27': 'lime',
  '\u0e19\u0e49\u0e33\u0e1b\u0e25\u0e32': 'fish sauce',
  '\u0e40\u0e19\u0e37\u0e49\u0e2d\u0e27\u0e31\u0e27': 'beef',
  '\u0e40\u0e15\u0e49\u0e32\u0e2b\u0e39\u0e49': 'tofu',
  '\u0e1b\u0e25\u0e32\u0e2b\u0e21\u0e36\u0e01': 'squid',
  '\u0e1b\u0e25\u0e32\u0e17\u0e39': 'mackerel',
  '\u0e40\u0e1a\u0e04\u0e2d\u0e19': 'bacon',
  '\u0e41\u0e2e\u0e21': 'ham',
  '\u0e21\u0e31\u0e19\u0e1d\u0e23\u0e31\u0e48\u0e07': 'potato',
  '\u0e1c\u0e31\u0e01\u0e1a\u0e38\u0e49\u0e07': 'morning glory',
  '\u0e01\u0e30\u0e2b\u0e25\u0e48\u0e33\u0e1b\u0e25\u0e35': 'cabbage',
  '\u0e41\u0e04\u0e23\u0e2d\u0e17': 'carrot',
  '\u0e1e\u0e23\u0e34\u0e01\u0e2b\u0e27\u0e32\u0e19': 'bell pepper',
  '\u0e40\u0e2b\u0e47\u0e14': 'mushroom',
  '\u0e27\u0e38\u0e49\u0e19\u0e40\u0e2a\u0e49\u0e19': 'vermicelli',
  '\u0e02\u0e19\u0e21\u0e1b\u0e31\u0e07': 'bread',
  '\u0e02\u0e34\u0e07': 'ginger',
  '\u0e43\u0e1a\u0e21\u0e30\u0e01\u0e23\u0e39\u0e14': 'kaffir lime leaves',
  '\u0e02\u0e48\u0e32': 'galangal',
  '\u0e15\u0e49\u0e19\u0e2b\u0e2d\u0e21': 'spring onion',
  '\u0e1c\u0e31\u0e01\u0e0a\u0e35': 'coriander',
  '\u0e1e\u0e23\u0e34\u0e01\u0e44\u0e17\u0e22': 'pepper',
  '\u0e0b\u0e2d\u0e2a\u0e2b\u0e2d\u0e22\u0e19\u0e32\u0e07\u0e23\u0e21': 'oyster sauce',
  '\u0e19\u0e49\u0e33\u0e15\u0e32\u0e25': 'sugar',
  '\u0e19\u0e49\u0e33\u0e21\u0e31\u0e19\u0e2b\u0e2d\u0e22': 'oyster sauce',
  '\u0e0b\u0e35\u0e2d\u0e34\u0e4a\u0e27\u0e02\u0e32\u0e27': 'light soy sauce',
  '\u0e0b\u0e35\u0e2d\u0e34\u0e4a\u0e27\u0e14\u0e33': 'dark soy sauce',
  '\u0e0b\u0e2d\u0e2a\u0e21\u0e30\u0e40\u0e02\u0e37\u0e2d\u0e40\u0e17\u0e28': 'ketchup',
  '\u0e0b\u0e2d\u0e2a\u0e1e\u0e23\u0e34\u0e01': 'chili sauce',
  '\u0e19\u0e49\u0e33\u0e21\u0e31\u0e19\u0e07\u0e32': 'sesame oil',
  '\u0e19\u0e49\u0e33\u0e2a\u0e49\u0e21\u0e2a\u0e32\u0e22\u0e0a\u0e39': 'vinegar',
  '\u0e1e\u0e23\u0e34\u0e01\u0e1b\u0e48\u0e19': 'chili flakes',
  '\u0e01\u0e30\u0e17\u0e34': 'coconut milk',
  '\u0e01\u0e30\u0e1b\u0e34': 'shrimp paste',
  '\u0e1b\u0e25\u0e32\u0e23\u0e49\u0e32': 'fermented fish',
  '\u0e44\u0e01\u0e48\u0e1a\u0e14': 'ground chicken',
  '\u0e2b\u0e21\u0e39\u0e1a\u0e14': 'ground pork',
  '\u0e2b\u0e2d\u0e22\u0e41\u0e04\u0e23\u0e07': 'blood cockle',
  '\u0e01\u0e38\u0e49\u0e07\u0e41\u0e2b\u0e49\u0e07': 'dried shrimp',
  '\u0e16\u0e31\u0e48\u0e27\u0e1d\u0e31\u0e01\u0e22\u0e32\u0e27': 'yardlong beans',
  '\u0e02\u0e49\u0e32\u0e27\u0e42\u0e1e\u0e14': 'corn',
  '\u0e1f\u0e31\u0e01\u0e17\u0e2d\u0e07': 'pumpkin',
  '\u0e41\u0e15\u0e07\u0e01\u0e27\u0e32': 'cucumber',
  '\u0e41\u0e15\u0e07\u0e01\u0e27\u0e32\u0e14\u0e2d\u0e07': 'pickled cucumber',
  '\u0e21\u0e30\u0e40\u0e02\u0e37\u0e2d\u0e22\u0e32\u0e27': 'eggplant',
  '\u0e21\u0e30\u0e40\u0e02\u0e37\u0e2d\u0e40\u0e1b\u0e23\u0e32\u0e30': 'thai eggplant',
  '\u0e43\u0e1a\u0e42\u0e2b\u0e23\u0e30\u0e1e\u0e32': 'basil',
  '\u0e43\u0e1a\u0e01\u0e30\u0e40\u0e1e\u0e23\u0e32': 'basil',
  '\u0e43\u0e1a\u0e2a\u0e30\u0e23\u0e30\u0e41\u0e2b\u0e19\u0e48': 'mint'
}

const INGREDIENT_THAI = {
  'egg': '\u0e44\u0e02\u0e48',
  'chicken': '\u0e44\u0e01\u0e48',
  'pork': '\u0e2b\u0e21\u0e39',
  'beef': '\u0e40\u0e19\u0e37\u0e49\u0e2d\u0e27\u0e31\u0e27',
  'shrimp': '\u0e01\u0e38\u0e49\u0e07',
  'squid': '\u0e1b\u0e25\u0e32\u0e2b\u0e21\u0e36\u0e01',
  'tofu': '\u0e40\u0e15\u0e49\u0e32\u0e2b\u0e39\u0e49',
  'rice': '\u0e02\u0e49\u0e32\u0e27',
  'noodles': '\u0e40\u0e2a\u0e49\u0e19\u0e01\u0e4b\u0e27\u0e22\u0e40\u0e15\u0e35\u0e4b\u0e22\u0e27',
  'vermicelli': '\u0e27\u0e38\u0e49\u0e19\u0e40\u0e2a\u0e49\u0e19',
  'bread': '\u0e02\u0e19\u0e21\u0e1b\u0e31\u0e07',
  'yardlong beans': '\u0e16\u0e31\u0e48\u0e27\u0e1d\u0e31\u0e01\u0e22\u0e32\u0e27',
  'kale': '\u0e04\u0e30\u0e19\u0e49\u0e32',
  'morning glory': '\u0e1c\u0e31\u0e01\u0e1a\u0e38\u0e49\u0e07',
  'cabbage': '\u0e01\u0e30\u0e2b\u0e25\u0e48\u0e33\u0e1b\u0e25\u0e35',
  'carrot': '\u0e41\u0e04\u0e23\u0e2d\u0e17',
  'tomato': '\u0e21\u0e30\u0e40\u0e02\u0e37\u0e2d\u0e40\u0e17\u0e28',
  'onion': '\u0e2b\u0e2d\u0e21\u0e43\u0e2b\u0e0d\u0e48',
  'mushroom': '\u0e40\u0e2b\u0e47\u0e14',
  'cucumber': '\u0e41\u0e15\u0e07\u0e01\u0e27\u0e32',
  'eggplant': '\u0e21\u0e30\u0e40\u0e02\u0e37\u0e2d\u0e22\u0e32\u0e27',
  'thai eggplant': '\u0e21\u0e30\u0e40\u0e02\u0e37\u0e2d\u0e40\u0e1b\u0e23\u0e32\u0e30',
  'basil': '\u0e42\u0e2b\u0e23\u0e30\u0e1e\u0e32',
  'garlic': '\u0e01\u0e23\u0e30\u0e40\u0e17\u0e35\u0e22\u0e21',
  'chili': '\u0e1e\u0e23\u0e34\u0e01',
  'ginger': '\u0e02\u0e34\u0e07',
  'spring onion': '\u0e15\u0e49\u0e19\u0e2b\u0e2d\u0e21',
  'coriander': '\u0e1c\u0e31\u0e01\u0e0a\u0e35',
  'potato': '\u0e21\u0e31\u0e19\u0e1d\u0e23\u0e31\u0e48\u0e07',
  'pumpkin': '\u0e1f\u0e31\u0e01\u0e17\u0e2d\u0e07',
  'corn': '\u0e02\u0e49\u0e32\u0e27\u0e42\u0e1e\u0e14',
  'bell pepper': '\u0e1e\u0e23\u0e34\u0e01\u0e2b\u0e27\u0e32\u0e19',
  'bean sprouts': '\u0e16\u0e31\u0e48\u0e27\u0e07\u0e2d\u0e01',
  'lime': '\u0e21\u0e30\u0e19\u0e32\u0e27',
  'lemongrass': '\u0e15\u0e30\u0e44\u0e04\u0e23\u0e49',
  'galangal': '\u0e02\u0e48\u0e32',
  'pineapple': '\u0e2a\u0e31\u0e1a\u0e1b\u0e30\u0e23\u0e14',
  'broccoli': '\u0e1a\u0e23\u0e2d\u0e01\u0e42\u0e04\u0e25\u0e35',
  'cauliflower': '\u0e14\u0e2d\u0e01\u0e01\u0e30\u0e2b\u0e25\u0e48\u0e33',
  'spinach': '\u0e1c\u0e31\u0e01\u0e42\u0e02\u0e21',
  'celery': '\u0e40\u0e0b\u0e40\u0e25\u0e2d\u0e23\u0e35',
  'lettuce': '\u0e1c\u0e31\u0e01\u0e01\u0e32\u0e14\u0e2b\u0e2d\u0e21',
  'bok choy': '\u0e1c\u0e31\u0e01\u0e01\u0e27\u0e32\u0e07\u0e15\u0e38\u0e49\u0e07',
  'seaweed': '\u0e2a\u0e32\u0e2b\u0e23\u0e48\u0e32\u0e22',
  'brown rice': '\u0e02\u0e49\u0e32\u0e27\u0e01\u0e25\u0e49\u0e2d\u0e07',
  'mackerel': '\u0e1b\u0e25\u0e32\u0e17\u0e39',
  'salmon': '\u0e1b\u0e25\u0e32\u0e41\u0e0b\u0e25\u0e21\u0e2d\u0e19',
  'crab stick': '\u0e1b\u0e39\u0e2d\u0e31\u0e14',
  'sausage': '\u0e44\u0e2a\u0e49\u0e01\u0e23\u0e2d\u0e01',
  'bacon': '\u0e40\u0e1a\u0e04\u0e2d\u0e19',
  'oil': '\u0e19\u0e49\u0e33\u0e21\u0e31\u0e19',
  'soy sauce': '\u0e0b\u0e35\u0e2d\u0e34\u0e4a\u0e27',
  'salt': '\u0e40\u0e01\u0e25\u0e37\u0e2d',
  'sugar': '\u0e19\u0e49\u0e33\u0e15\u0e32\u0e25',
  'fish sauce': '\u0e19\u0e49\u0e33\u0e1b\u0e25\u0e32',
  'oyster sauce': '\u0e0b\u0e2d\u0e2a\u0e2b\u0e2d\u0e22\u0e19\u0e32\u0e07\u0e23\u0e21',
  'pepper': '\u0e1e\u0e23\u0e34\u0e01\u0e44\u0e17\u0e22',
  'vinegar': '\u0e19\u0e49\u0e33\u0e2a\u0e49\u0e21\u0e2a\u0e32\u0e22\u0e0a\u0e39',
  'sesame oil': '\u0e19\u0e49\u0e33\u0e21\u0e31\u0e19\u0e07\u0e32',
  'chili flakes': '\u0e1e\u0e23\u0e34\u0e01\u0e1b\u0e48\u0e19',
  'coconut milk': '\u0e01\u0e30\u0e17\u0e34',
  'shrimp paste': '\u0e01\u0e30\u0e1b\u0e34',
  'fermented fish': '\u0e1b\u0e25\u0e32\u0e23\u0e49\u0e32',
  'light soy sauce': '\u0e0b\u0e35\u0e2d\u0e34\u0e4a\u0e27\u0e02\u0e32\u0e27',
  'dark soy sauce': '\u0e0b\u0e35\u0e2d\u0e34\u0e4a\u0e27\u0e14\u0e33',
  'ketchup': '\u0e0b\u0e2d\u0e2a\u0e21\u0e30\u0e40\u0e02\u0e37\u0e2d\u0e40\u0e17\u0e28',
  'chili sauce': '\u0e0b\u0e2d\u0e2a\u0e1e\u0e23\u0e34\u0e01',
  'kaffir lime leaves': '\u0e43\u0e1a\u0e21\u0e30\u0e01\u0e23\u0e39\u0e14',
  'ham': '\u0e41\u0e2e\u0e21',
  'ground chicken': '\u0e44\u0e01\u0e48\u0e1a\u0e14',
  'ground pork': '\u0e2b\u0e21\u0e39\u0e1a\u0e14',
  'blood cockle': '\u0e2b\u0e2d\u0e22\u0e41\u0e04\u0e23\u0e07',
  'dried shrimp': '\u0e01\u0e38\u0e49\u0e07\u0e41\u0e2b\u0e49\u0e07',
  'mint': '\u0e2a\u0e30\u0e23\u0e30\u0e41\u0e2b\u0e19\u0e48'
}

const looksGarbled = (text = '') => {
  const value = String(text)
  if (/[?]{2,}/.test(value)) return true
  if (/[\u4E00-\u9FFF\uFFFD]/.test(value)) return true
  if (/[\u0000-\u001F\u007F-\u009F]/.test(value)) return true
  return false
}

const hasThai = (text = '') => /[\u0E00-\u0E7F]/.test(String(text))

const toThai = (item) => INGREDIENT_THAI[item] || item

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const translateNameToThai = (name = '') => {
  let result = name
  const methodMap = {
    'stir fry': 'ผัด',
    fried: 'ทอด',
    soup: 'ซุป',
    salad: 'สลัด',
    grilled: 'ย่าง',
    curry: 'แกง',
    omelet: 'ไข่เจียว',
    stew: 'ตุ๋น',
    'rice bowl': 'ข้าวหน้า'
  }
  Object.entries(methodMap).forEach(([en, th]) => {
    result = result.replace(new RegExp(en, 'gi'), th)
  })
  Object.entries(INGREDIENT_THAI).forEach(([en, th]) => {
    result = result.replace(new RegExp(`\\b${escapeRegex(en)}\\b`, 'gi'), th)
  })
  result = result.replace(/\bwith\b/gi, 'ใส่')
  result = result.replace(/(?<=[\u0E00-\u0E7F])\s+(?=[\u0E00-\u0E7F])/g, '')
  return result
}

const genericStepsTh = () => [
  'เตรียมวัตถุดิบ ล้างและหั่นให้พอดีคำ',
  'ตั้งกระทะ ใส่น้ำมัน แล้วผัดวัตถุดิบหลักให้สุก',
  'ใส่ผักและคาร์บ แล้วผัดให้เข้ากัน',
  'ปรุงรสตามชอบ แล้วจัดเสิร์ฟ'
]

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

  try {
    const recipes = await prisma.recipe.findMany()
    const userCanon = new Set(toCanonical(ingredients))

    const scored = recipes.map((recipe) => {
      const safeNameTh =
        !recipe.name_th || looksGarbled(recipe.name_th) || !hasThai(recipe.name_th)
        ? translateNameToThai(recipe.name_en || '')
        : recipe.name_th
      const safeIngredientsTh =
        Array.isArray(recipe.ingredients_th) &&
        recipe.ingredients_th.length === recipe.ingredients_en.length &&
        !recipe.ingredients_th.some((item) => looksGarbled(item) || !hasThai(item))
          ? recipe.ingredients_th
          : recipe.ingredients_en.map((item) => toThai(item))
      const safeSeasoningsTh =
        Array.isArray(recipe.seasonings_th) &&
        recipe.seasonings_th.length > 0 &&
        !recipe.seasonings_th.some((item) => looksGarbled(item) || !hasThai(item))
          ? recipe.seasonings_th
          : recipe.seasonings_en.map((item) => toThai(item))
      const safeStepsTh =
        Array.isArray(recipe.steps_th) &&
        recipe.steps_th.length > 0 &&
        !recipe.steps_th.some((item) => looksGarbled(item) || !hasThai(item))
          ? recipe.steps_th
          : genericStepsTh()

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
        const thItem = safeIngredientsTh[idx] || enItem
        displayMapTh[canon] = thItem
        displayMapEn[canon] = enItem
      })

      const missingCanon = [...recipeCanon].filter((item) => !overlap.includes(item))
      const missing_th = missingCanon.map((item) => displayMapTh[item] || item).slice(0, 3)
      const missing_en = missingCanon.map((item) => displayMapEn[item] || item).slice(0, 3)

      const candidateReason = recipe.ai_reason
      const aiReason =
        candidateReason &&
        ((language === 'th' && /[\u0E00-\u0E7F]/.test(candidateReason)) ||
          (language === 'en' && !/[\u0E00-\u0E7F]/.test(candidateReason)))
          ? candidateReason
          : fallbackReason(language, matched)

      return {
        id: recipe.id,
        name_en: recipe.name_en,
        name_th: safeNameTh,
        ingredients_en: recipe.ingredients_en,
        ingredients_th: safeIngredientsTh,
        seasonings_en: recipe.seasonings_en,
        seasonings_th: safeSeasoningsTh,
        score,
        matched: [...new Set(matched)],
        missing_en,
        missing_th,
        ai_reason: aiReason,
        ai_missing: language === 'th' ? missing_th : missing_en,
        ai_substitutes: [],
        time_min: recipe.time_min,
        difficulty: recipe.difficulty,
        steps_en: recipe.steps_en,
        steps_th: safeStepsTh
      }
    })

    const filtered = scored.filter((item) => item.score > 0)
    filtered.sort((a, b) => b.score - a.score)
    res.json({ input: ingredients, language, results: filtered.slice(0, 5) })
  } catch (error) {
    console.error('Recommend failed:', error)
    res.status(500).json({
      error: 'Database unavailable',
      detail: 'Please check DATABASE_URL in Render and Supabase connectivity.'
    })
  }
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
})

const port = process.env.PORT || 8001
app.listen(port, () => {
  console.log(`API running on port ${port}`)
})
