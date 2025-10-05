import streamlit as st
import requests
from config import INDEX_DIR

API_URL = 'http://localhost:8000'

st.title('ИИ-архивариус — поиск по документам')

st.markdown('''
Введите запрос на естественном языке. Пример: **Найди все приказы об отпусках за 2023 год**
''')

query = st.text_input('Запрос')
if st.button('Найти'):
    if not query:
        st.warning('Введите запрос')
    else:
        with st.spinner('Идёт поиск...'):
            try:
                r = requests.post(f'{API_URL}/query', json={'query': query}, timeout=60)
                r.raise_for_status()
                data = r.json()
                st.subheader('Ответ')
                st.write(data['result'])
            except Exception as e:
                st.error(f'Ошибка запроса: {e}')

st.markdown('---')
st.markdown('Если индекс ещё не создан — запусти `python server.py` и POST /index или запусти `python indexer.py`')