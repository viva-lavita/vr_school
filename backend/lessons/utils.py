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
