from langchain.chains import RetrievalQA
from langchain_ollama import OllamaLLM
from langchain.vectorstores import FAISS
from langchain_ollama.embeddings import OllamaEmbeddings
from config import OLLAMA_LLM_MODEL, INDEX_DIR, TOP_K, OLLAMA_EMBED_MODEL
from embeddings import get_ollama_embeddings

from langchain_core.documents import Document
from typing import List
from langchain.prompts import PromptTemplate
from langchain_core.retrievers import BaseRetriever

class ThresholdRetriever(BaseRetriever):
    vectorstore: FAISS
    k: int = 5
    score_threshold: float = 0.8

    class Config:
        arbitrary_types_allowed = True

    def _get_relevant_documents(self, query: str) -> List[Document]:
        docs_and_scores = self.vectorstore.similarity_search_with_score(query, k=self.k)

        filtered_docs = [
            doc for doc, score in docs_and_scores
            if score < self.score_threshold
        ]
        return filtered_docs

class QAAgent:
    def __init__(self, index_dir: str = None, llm_model: str = None):
        self.index_dir = INDEX_DIR
        self.llm_model = OLLAMA_LLM_MODEL
        self.llm = OllamaLLM(model=self.llm_model)

        self.load_actual_index()

    def _load_vectorstore(self):
        """Загружает/перезагружает векторное хранилище"""
        emb = get_ollama_embeddings()
        self.vectorstore = FAISS.load_local(str(self.index_dir), emb, allow_dangerous_deserialization=True)
    
    def _create_qa_chain(self):
        # Основной промпт, который видит модель
        template = """Используй следующие фрагменты документов, чтобы ответить на вопрос в конце.
        Отвечай развернуто и по делу.
        В конце своего ответа всегда указывай документ-источник, из которого ты взял информацию, в формате: (Источник: <название_документа>).
        Если в документах нет информации по вопросу, напиши: "В предоставленных документах нет информации по вашему запросу."

        Документы:
        {context}

        Вопрос: {question}

        Ответ:"""
        QA_CHAIN_PROMPT = PromptTemplate.from_template(template)

        # Промпт для каждого отдельного документа в контексте
        # Добавляем источник к каждому чанку, чтобы модель его видела
        document_prompt_template = """Источник: {source}\n\n---\n\n{page_content}"""
        DOCUMENT_PROMPT = PromptTemplate.from_template(document_prompt_template)

        self.qa = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type='stuff',
            retriever = ThresholdRetriever(
                vectorstore=self.vectorstore,
                k=TOP_K,
                score_threshold=0.8
            ),
            return_source_documents=True,
            chain_type_kwargs={
                "prompt": QA_CHAIN_PROMPT,
                "document_prompt": DOCUMENT_PROMPT
            }
        )
    
    def load_actual_index(self):
        """Загружает акутальный индекс и цепочку"""
        self._load_vectorstore()
        self._create_qa_chain()

    def ask(self, query: str):
        """Выполняет запрос и возвращает текст ответа + список документов-источников"""
        result = self.qa.invoke(query)

        if isinstance(result, dict):
            answer = result.get('result', '')
            source_docs = result.get('source_documents', [])
        else:
            answer = str(result)
            source_docs = []

        sources = []
        for doc in source_docs:
            meta = getattr(doc, 'metadata', {})
            src = meta.get('source') or meta.get('file_name') or 'неизвестный документ'
            sources.append(src)

        sources = list(set(sources))

        return {
            'answer': answer,
            'sources': sources
        }

if __name__ == '__main__':
    agent = QAAgent()
    q = 'Найди все приказы об отпусках за 2023 год'
    res = agent.ask(q)
    print("Ответ:", res["answer"])
    print("Документы:", res["sources"])