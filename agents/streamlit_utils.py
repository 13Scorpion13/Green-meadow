import streamlit as st
from pathlib import Path
from urllib.parse import quote
from typing import List
import html
import requests

def load_css(file_path: str):
    try:
        with open(file_path) as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    except FileNotFoundError:
        st.error(f"Файл стилей не найден: {file_path}")

def display_file_links(source_paths: List[str], api_url: str):

    st.subheader('Источники:')

    links_list = []
    for source_path_str in source_paths:
        source_path = Path(source_path_str)
        filename = source_path.name
        encoded_filename_for_url = quote(filename)
        download_url = f"{api_url}/download/{encoded_filename_for_url}"
        escaped_filename_for_html = html.escape(filename)

        link_html = (
            f'<a href="{download_url}" class="file-link" download="{escaped_filename_for_html}" target="_blank">'
            f'<span class="file-link-icon">📄</span>'
            f'<span>{escaped_filename_for_html}</span>'
            f'</a>'
        )
        links_list.append(link_html)

    all_links_html = "".join(links_list)
    st.markdown(f'<div class="file-link-container">{all_links_html}</div>', unsafe_allow_html=True)

    st.markdown("---")

    _, col2, _ = st.columns([0.3, 0.4, 0.3])
    with col2:
        with st.form("download_form"):
            submitted = st.form_submit_button("Сформировать архив с файлами", use_container_width=True)
            if submitted:
                with st.spinner("Создание архива..."):
                    try:
                        response = requests.post(
                            f"{api_url}/download_all",
                            json={"source_paths": source_paths},
                            timeout=60
                        )
                        response.raise_for_status()
                        st.session_state.zip_data = response.content
                        st.session_state.zip_filename = "sources.zip"
                    except Exception as e:
                        st.error(f"Ошибка создания архива: {e}")
                        st.session_state.zip_data = None

    if st.session_state.get("zip_data"):
        _, col2, _ = st.columns([0.3, 0.4, 0.3])
        with col2:
            st.download_button(
                label="✅ Архив готов. Нажмите, чтобы скачать.",
                data=st.session_state.zip_data,
                file_name=st.session_state.zip_filename,
                mime="application/zip",
                on_click=lambda: st.session_state.update(zip_data=None, zip_filename=None),
                use_container_width=True
            )