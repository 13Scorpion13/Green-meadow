from typing import List, Dict


def format_sources(raw_response) -> List[Dict]:
    """
    Функция-заглушка: форматирует ответ от RetrievalQA в список источников.
    В зависимости от chain_type результат может быть строкой или dict — здесь надо адаптировать под используемый chain.
    """
    if isinstance(raw_response, str):
        return [{'text': raw_response}]
    if isinstance(raw_response, dict):
        return [raw_response]
    return [{'text': str(raw_response)}]