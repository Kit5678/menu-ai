from __future__ import annotations

from pathlib import Path
from typing import List
import json
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "sample_recipes.json"

load_dotenv()

app = FastAPI(title="Menu Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    ingredients: List[str]
    language: str = "th"


class RecommendItem(BaseModel):
    id: int | None
    name_en: str | None
    name_th: str | None
    ingredients_en: List[str]
    ingredients_th: List[str]
    seasonings_en: List[str] = []
    seasonings_th: List[str] = []
    score: float
    matched: List[str]
    ai_reason: str | None = None
    ai_missing: List[str] = []
    ai_substitutes: List[str] = []
    time_min: int | None = None
    difficulty: str | None = None
    steps_en: List[str] = []
    steps_th: List[str] = []


INGREDIENT_ALIASES = {
    "ไข่": "egg",
    "กระเทียม": "garlic",
    "ข้าว": "rice",
    "ไก่": "chicken",
    "โหระพา": "basil",
    "กะเพรา": "basil",
    "พริก": "chili",
    "เส้นก๋วยเตี๋ยว": "noodles",
    "ถั่วงอก": "bean sprouts",
    "หมู": "pork",
    "คะน้า": "kale",
    "น้ำมัน": "oil",
    "ซีอิ๊ว": "soy sauce",
    "หอมใหญ่": "onion",
    "มะเขือเทศ": "tomato",
    "เกลือ": "salt",
    "กุ้ง": "shrimp",
    "ตะไคร้": "lemongrass",
    "มะนาว": "lime",
    "น้ำปลา": "fish sauce",
    "เนื้อวัว": "beef",
    "เต้าหู้": "tofu",
    "ปลาหมึก": "squid",
    "ปลาทู": "mackerel",
    "เบคอน": "bacon",
    "แฮม": "ham",
    "มันฝรั่ง": "potato",
    "ผักบุ้ง": "morning glory",
    "กะหล่ำปลี": "cabbage",
    "แครอท": "carrot",
    "พริกหวาน": "bell pepper",
    "เห็ด": "mushroom",
    "วุ้นเส้น": "vermicelli",
    "ขนมปัง": "bread",
    "ขิง": "ginger",
    "ใบมะกรูด": "kaffir lime leaves",
    "ข่า": "galangal",
    "ต้นหอม": "spring onion",
    "ผักชี": "coriander",
    "พริกไทย": "pepper",
    "ซอสหอยนางรม": "oyster sauce",
    "น้ำตาล": "sugar",
    "น้ำมันหอย": "oyster sauce",
    "ซีอิ๊วขาว": "light soy sauce",
    "ซีอิ๊วดำ": "dark soy sauce",
    "ซอสมะเขือเทศ": "ketchup",
    "ซอสพริก": "chili sauce",
    "น้ำมันงา": "sesame oil",
    "น้ำส้มสายชู": "vinegar",
    "พริกป่น": "chili flakes",
    "กะทิ": "coconut milk",
    "กะปิ": "shrimp paste",
    "ปลาร้า": "fermented fish",
    "ไก่บด": "ground chicken",
    "หมูบด": "ground pork",
    "เบคอน": "bacon",
    "แฮม": "ham",
    "ปลาทู": "mackerel",
    "ปลาหมึก": "squid",
    "หอยแครง": "blood cockle",
    "กุ้งแห้ง": "dried shrimp",
    "ถั่วฝักยาว": "yardlong beans",
    "ข้าวโพด": "corn",
    "ฟักทอง": "pumpkin",
    "แตงกวา": "cucumber",
    "แตงกวาดอง": "pickled cucumber",
    "มะเขือยาว": "eggplant",
    "มะเขือเปราะ": "thai eggplant",
    "ใบโหระพา": "basil",
    "ใบกะเพรา": "basil",
    "ใบสะระแหน่": "mint",
}


def _normalize(items: List[str]) -> List[str]:
    return [item.strip().lower() for item in items if item.strip()]


def _to_canonical(items: List[str]) -> List[str]:
    normalized = _normalize(items)
    return [INGREDIENT_ALIASES.get(item, item) for item in normalized]


def _load_recipes() -> list[dict]:
    with DATA_PATH.open("r", encoding="utf-8-sig") as f:
        data = json.load(f)
    return data.get("recipes", [])


def _score(recipe_ingredients: List[str], user_ingredients: List[str]) -> float:
    recipe_set = set(_to_canonical(recipe_ingredients))
    user_set = set(_to_canonical(user_ingredients))
    if not recipe_set:
        return 0.0
    overlap = recipe_set.intersection(user_set)
    return len(overlap) / len(recipe_set)


def _get_gemini_client() -> genai.GenerativeModel | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")


def _enrich_with_gemini(
    user_ingredients: List[str], items: list[RecommendItem], language: str
) -> list[RecommendItem]:
    model = _get_gemini_client()
    if model is None:
        return items

    prompt = {
        "role": "user",
        "parts": [
            (
                "You are assisting a recipe recommendation system. "
                "Return JSON only (no markdown). For each recipe, provide:\n"
                "- id\n"
                "- reason: short explanation in the requested language\n"
                "- missing_ingredients: up to 3 ingredients missing\n"
                "- substitutes: up to 3 simple substitutes for missing ingredients\n\n"
                f"Language: {language}\n"
                "User ingredients:\n"
                f"{user_ingredients}\n\n"
                "Recipes:\n"
                f"{[{'id': item.id, 'name_en': item.name_en, 'name_th': item.name_th, 'ingredients': item.ingredients_en} for item in items]}\n"
            )
        ],
    }

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.strip("`")
            if text.lower().startswith("json"):
                text = text[4:].strip()
        start = text.find("[")
        end = text.rfind("]")
        if start != -1 and end != -1:
            text = text[start : end + 1]
        data = json.loads(text)
    except Exception:
        return items

    if not isinstance(data, list):
        return items

    by_id = {item.id: item for item in items}
    for entry in data:
        if not isinstance(entry, dict):
            continue
        item_id = entry.get("id")
        if item_id in by_id:
            target = by_id[item_id]
            target.ai_reason = entry.get("reason")
            target.ai_missing = entry.get("missing_ingredients", []) or []
            target.ai_substitutes = entry.get("substitutes", []) or []

    return items


def _fallback_reason(
    lang: str, matched: List[str], missing: List[str]
) -> str:
    if lang == "th":
        if matched:
            return f"วัตถุดิบตรงกัน {len(matched)} รายการ เหมาะสำหรับทำเมนูนี้"
        return "เมนูนี้ยังขาดวัตถุดิบบางส่วน แต่สามารถปรับได้"
    if matched:
        return f"{len(matched)} ingredients match. This recipe is a good fit."
    return "Some ingredients are missing, but it can be adapted."


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/recommend")
def recommend(payload: RecommendRequest) -> dict:
    recipes = _load_recipes()
    user_ingredients = payload.ingredients
    lang = payload.language if payload.language in ("th", "en") else "th"
    user_canon = set(_to_canonical(user_ingredients))
    scored = []
    for recipe in recipes:
        recipe_en = recipe.get("ingredients_en", [])
        recipe_th = recipe.get("ingredients_th", [])
        score_raw = _score(recipe_en, user_ingredients)
        score = int(round(score_raw * 10))
        recipe_canon = set(_to_canonical(recipe_en))
        overlap = recipe_canon.intersection(user_canon)
        matched = []
        for original in user_ingredients:
            if _to_canonical([original])[0] in overlap:
                matched.append(original)
        missing = list(recipe_canon.difference(overlap))
        display_map = {}
        for en_item, th_item in zip(recipe_en, recipe_th):
            display_map[_to_canonical([en_item])[0]] = th_item if lang == "th" else en_item
        missing_list = [display_map.get(val, val) for val in missing]
        scored.append(
            RecommendItem(
                id=recipe.get("id"),
                name_en=recipe.get("name_en"),
                name_th=recipe.get("name_th"),
                ingredients_en=recipe_en,
                ingredients_th=recipe_th,
                seasonings_en=recipe.get("seasonings_en", []),
                seasonings_th=recipe.get("seasonings_th", []),
                score=score,
                matched=sorted(set(matched)),
                ai_missing=missing_list[:3],
                time_min=recipe.get("time_min"),
                difficulty=recipe.get("difficulty"),
                steps_en=recipe.get("steps_en", []),
                steps_th=recipe.get("steps_th", []),
            )
        )

    scored.sort(key=lambda item: item.score, reverse=True)
    top_items = scored[:5]
    top_items = _enrich_with_gemini(user_ingredients, top_items, lang)
    for item in top_items:
        if not item.ai_reason:
            item.ai_reason = _fallback_reason(lang, item.matched, item.ai_missing)
    return {
        "input": user_ingredients,
        "language": lang,
        "results": [item.model_dump() for item in top_items],
    }
