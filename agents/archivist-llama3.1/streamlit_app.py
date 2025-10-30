import streamlit as st
import requests

from streamlit_utils import load_css, display_file_links

if "query_results" not in st.session_state:
    st.session_state.query_results = None
if "zip_data" not in st.session_state:
    st.session_state.zip_data = None
if "zip_filename" not in st.session_state:
    st.session_state.zip_filename = None
# -----------------------------------------

API_URL = 'http://localhost:8000'

st.set_page_config(layout="wide")
load_css('style.css')

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
                r = requests.post(f'{API_URL}/query', json={'query': query})
                r.raise_for_status()
                st.session_state.query_results = r.json()
                st.session_state.zip_data = None
                st.session_state.zip_filename = None
            except Exception as e:
                st.error(f'Ошибка запроса: {e}')
                st.session_state.query_results = None

if st.session_state.query_results:
    data = st.session_state.query_results

    st.subheader('Ответ')
    st.write(data['answer'])

    if data.get('sources'):
        display_file_links(data['sources'], API_URL)

st.markdown('---')
st.markdown('Если индекс ещё не создан — запусти `python server.py` и POST /index или запусти `python indexer.py`')