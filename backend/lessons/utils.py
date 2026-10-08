import os
import re

import requests

from lessons.models import TestKeyVariant


def get_key_value_table(question_id):
    # Один запрос + один JOIN для значений
    keys = TestKeyVariant.objects.filter(test_element_id=question_id).prefetch_related("values")

    result = []
    for k in keys:
        # Собираем список ID значений для этого ключа
        values_ids = [v.pk for v in k.values.all()]
        result.append(
            {
                "key": k.pk,
                "values": values_ids,
            }
        )

    return result


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = os.getenv("OPENROUTER_PATH")

# TODO: под согласование:
# Можно добавить в промпт примеры «нормы» для разных классов, например:
# «Для 5–6 класса допустимы простые предложения и базовая лексика; для 9–11 класса ожидаем более сложную структуру и разнообразную лексику. Не требуй от пятиклассника уровня выпускника.»


def evaluate_essay(
    essay_text: str,
    class_label: str,
    mention_things: str,
    max_points: int,
    subject_name: str,
    theme: str,
) -> int:
    """
    Оценивает эссе на английском от школьника.
    Возвращает целое число баллов: от 1 до max_points.
    """

    # Промпт на русском: чётко говорим, кто ученик, что проверяем, и какой формат вывода нужен
    prompt = (
        f"Ты — школьный учитель по предмету {subject_name} и проверяешь задание, выполненное российским школьником {class_label} класса. "
        f"Задание: "
        f"{theme}. "
        f"На основании данного описания: "
        f"{mention_things} "
        f" по шкале от 1 до {max_points} баллов произведи оценку ответа школьника: "
        f"{essay_text}. "
        f"Верни ТОЛЬКО одно целое число от 1 до {max_points}. Никаких пояснений, комментариев, markdown, скобок или текста. "
    )

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "deepseek/deepseek-chat",
        "messages": [
            {
                "role": "system",
                "content": (
                    f"Ты строгий, но справедливый преподаватель по предмету {subject_name} для русских школьников. "
                    f"Твоя задача — выставить оценку в виде одного целого числа от 1 до {max_points}. "
                    "Не пиши ничего кроме этого числа. Никаких слов, объяснений, скобок, markdown."
                ),
            },
            {"role": "user", "content": f"{prompt}\n\nЭссе:\n{essay_text}"},
        ],
        "max_tokens": 32,
        "temperature": 0.0,
    }

    resp = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    content = data["choices"][0]["message"]["content"].strip()

    match = re.search(r"\b(\d+)\b", content)
    if not match:
        raise ValueError(f"Не удалось распарсить ответ модели: {content!r}")

    score = int(match.group(1))
    return max(0, min(max_points, score))
