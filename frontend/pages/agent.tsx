"use client";

import { useState } from "react";
import Link from "next/link";

export default function AgentDetailsPage() {
  const [activeTab, setActiveTab] = useState<"description" | "guide" | "discussions">("description");

  const [comments, setComments] = useState([
    {
      id: 1,
      author: "User123",
      avatar: "/images/icons/ui/UserProfile.svg",
      date: "2 дня назад",
      text: "Отличный агент! Сэкономил мне кучу времени. Очень доволен функционалом и скоростью работы. Рекомендую всем разработчикам!"
    },
    {
      id: 2,
      author: "DevGirl",
      avatar: "/images/icons/ui/UserProfile.svg",
      date: "1 день назад",
      text: "Иногда генерирует не совсем оптимальный код, но в целом очень помогает в рутинных задачах. Хотелось бы больше настроек для стилизации генерируемого кода."
    },
    {
      id: 3,
      author: "AnonUser",
      avatar: "/images/icons/ui/UserProfile.svg",
      date: "5 часов назад",
      text: "Есть ли планы по добавлению поддержки языка Go? Было бы очень полезно!"
    }
  ]);
  const [commentText, setCommentText] = useState("");

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const next = {
      id: Date.now(),
      author: "You",
      avatar: "/images/icons/ui/UserProfile.svg",
      date: "только что",
      text: commentText.trim()
    };
    setComments([next, ...comments]);
    setCommentText("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="main-header">
        <div className="container header-container">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                <img src="/images/logos/Bot.svg" alt="AI Market Logo" />
              </div>
              <div>
                <h1 className="logo-title">AI Market</h1>
                <p className="logo-subtitle">Маркетплейс агентов</p>
              </div>
            </div>
            <nav className="main-nav">
              <Link href="/">Каталог</Link>
              <a href="#">Как работает</a>
              <a href="#">Для разработчиков</a>
              <a href="#">Сообщество</a>
            </nav>
          </div>

          <div className="header-right">
            <button className="icon-button">
              <img src="/images/icons/ui/ShoppingCart.svg" alt="Shopping Cart" />
            </button>
            <button className="icon-button" id="user-profile-button">
              <img src="/images/icons/ui/UserProfile.svg" alt="User Profile" />
            </button>
            <button className="btn btn--primary login-button">Войти/Зарегистрироваться</button>
            <button className="menu-button">
              <img src="/images/icons/ui/Menu.svg" alt="Menu" />
            </button>
          </div>
        </div>
      </header>

      <main className="main-content container">
        <div className="back-to-catalog">
          <Link href="/" className="btn btn--secondary">&lt; Назад в каталог</Link>
        </div>

        <div className="agent-details-page">
          <div className="agent-details-main">
            <div className="agent-card-detailed">
              <div className="agent-header">
                <div className="agent-avatar">C</div>
                <div className="agent-info">
                  <h1 className="agent-name">CodeMaster Pro</h1>
                  <h2 className="agent-author">от <a href="#">TopDevs</a></h2>
                </div>
              </div>

              <p className="agent-description">
                Профессиональный ИИ-разработчик, специализирующийся на React, Node.js и Python. Создает качественный код с тестами и документацией.
              </p>

              <div className="agent-stats">
                <div className="stat">
                  <img src="/images/icons/ui/Star.svg" alt="Star Icon" />
                  <span>4.9</span>
                  <span>(234 отзыва)</span>
                </div>
                <div className="stat">
                  <img src="/images/icons/ui/Users.svg" alt="Users Icon" />
                  <span>1250 пользователей</span>
                </div>
              </div>
            </div>

            <div className="agent-tabs">
              <button
                className={`tab-button ${activeTab === "description" ? "active" : ""}`}
                onClick={() => setActiveTab("description")}
              >
                Описание
              </button>
              <button
                className={`tab-button ${activeTab === "guide" ? "active" : ""}`}
                onClick={() => setActiveTab("guide")}
              >
                Руководство
              </button>
              <button
                className={`tab-button ${activeTab === "discussions" ? "active" : ""}`}
                onClick={() => setActiveTab("discussions")}
              >
                Обсуждения
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "description" && (
                <div className={`tab-pane ${activeTab === "description" ? "active" : ""}`} id="description">
                  <h2>Подробное описание CodeMaster Pro</h2>
                  <p>CodeMaster Pro - это инновационный ИИ-агент, созданный для революционизации процесса разработки программного обеспечения. Он использует передовые алгоритмы машинного обучения и глубокие нейронные сети, обученные на обширной базе данных высококачественного кода из ведущих open-source проектов. Это позволяет ему не только генерировать код, но и понимать контекст, архитектурные паттерны и лучшие практики разработки.</p>
                  <p>Агент способен работать с широким спектром технологий, включая современные фреймворки и библиотеки. Он идеально подходит для команд, стремящихся к повышению продуктивности, сокращению времени на разработку и поддержанию высокого качества кодовой базы.</p>
                  <h3>Ключевые возможности:</h3>
                  <ul>
                    <li><strong>Интеллектуальная генерация кода:</strong> Создание функционального и оптимизированного кода на основе высокоуровневых текстовых описаний или спецификаций. Поддержка Python, JavaScript (React, Node.js), TypeScript, Java, Go и других языков.</li>
                    <li><strong>Автоматический рефакторинг и оптимизация:</strong> Анализ существующего кода, выявление узких мест и предложение улучшений для повышения производительности, читаемости и поддерживаемости.</li>
                    <li><strong>Комплексное тестирование:</strong> Автоматическое создание юнит-тестов, интеграционных тестов и моков для обеспечения надежности и стабильности вашего приложения.</li>
                    <li><strong>Генерация документации:</strong> Создание подробной и актуальной технической документации, включая комментарии к коду, README файлы и API-спецификации.</li>
                    <li><strong>Помощь в отладке и анализе ошибок:</strong> Идентификация потенциальных ошибок, предложение решений и объяснение причин их возникновения.</li>
                    <li><strong>Интеграция с IDE:</strong> Бесшовная работа с популярными интегрированными средами разработки (VS Code, IntelliJ IDEA, PyCharm) через специализированные плагины.</li>
                  </ul>
                  <h3>Преимущества использования:</h3>
                  <ul>
                    <li>Сокращение времени разработки до 40%.</li>
                    <li>Повышение качества кода и уменьшение количества багов.</li>
                    <li>Освобождение разработчиков от рутинных задач для фокусировки на более сложных архитектурных решениях.</li>
                    <li>Улучшение консистентности кодовой базы.</li>
                  </ul>
                </div>
              )}

              {activeTab === "guide" && (
                <div className={`tab-pane ${activeTab === "guide" ? "active" : ""}`} id="guide">
                  <h2>Руководство по установке и запуску</h2>
                  <p>CodeMaster Pro является open-source проектом, и вы можете скачать его исходный код для локального развертывания или использовать через наш CLI.</p>
                  <h3>Вариант 1: Локальная установка (рекомендуется для разработчиков)</h3>
                  <ol>
                    <li><strong>Клонируйте репозиторий:</strong>
                      <pre><code>git clone https://github.com/your-org/codemaster-pro.git</code></pre>
                    </li>
                    <li><strong>Перейдите в директорию проекта:</strong>
                      <pre><code>cd codemaster-pro</code></pre>
                    </li>
                    <li><strong>Установите зависимости:</strong>
                      <pre><code>npm install   # Для JavaScript/Node.js проектов
pip install -r requirements.txt # Для Python проектов</code></pre>
                    </li>
                    <li><strong>Настройте переменные окружения:</strong> Создайте файл <code>.env</code> на основе <code>.env.example</code> и укажите необходимые параметры (например, ключи API для внешних сервисов, если применимо).</li>
                    <li><strong>Запустите агент:</strong>
                      <pre><code>npm start     # Для JavaScript/Node.js проектов
python main.py  # Для Python проектов</code></pre>
                    </li>
                    <li><strong>Доступ к API:</strong> После запуска агент будет доступен по адресу <code>http://localhost:3000/api/v1/codemaster</code> (порт может отличаться).</li>
                  </ol>
                  <h3>Вариант 2: Использование через CLI (для быстрого старта)</h3>
                  <p>Если вы предпочитаете не разворачивать агент локально, вы можете использовать наш унифицированный CLI для взаимодействия с облачной версией CodeMaster Pro.</p>
                  <ol>
                    <li><strong>Установите AI Market CLI:</strong>
                      <pre><code>npm install -g @aimarket/cli</code></pre>
                    </li>
                    <li><strong>Авторизуйтесь:</strong>
                      <pre><code>aimarket login</code></pre>
                    </li>
                    <li><strong>Используйте агент:</strong>
                      <pre><code>aimarket run codemaster-pro --prompt "Создай React компонент кнопки с кастомными стилями"</code></pre>
                      <p>Для получения дополнительной информации о командах CLI используйте <code>aimarket help</code>.</p>
                    </li>
                  </ol>
                </div>
              )}

              {activeTab === "discussions" && (
                <div className={`tab-pane ${activeTab === "discussions" ? "active" : ""}`} id="discussions">
                  <h2>Обсуждения</h2>
                  <div className="discussions-list">
                    <a href="#" className="discussion-item">Вопрос по интеграции с VS Code</a>
                    <a href="#" className="discussion-item">Предложения по новым функциям</a>
                    <a href="#" className="discussion-item">Проблема с генерацией кода на Python</a>
                    <a href="#" className="discussion-item">Обсуждение производительности</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="agent-details-sidebar">
            <div className="sidebar-widget">
              <button className="btn btn--primary btn--large rent-button-detailed">Скачать</button>
            </div>
            <div className="sidebar-widget">
              <h3>Категории</h3>
              <div className="agent-categories">
                <a href="#" className="category-link">Программирование</a>
              </div>
            </div>
            <div className="sidebar-widget">
              <h3>Теги</h3>
              <div className="agent-tags">
                <div className="tag">React</div>
                <div className="tag">Python</div>
                <div className="tag">Node.js</div>
                <div className="tag">JavaScript</div>
                <div className="tag">Тестирование</div>
              </div>
            </div>
          </div>
        </div>

        <div className="comments-section-outer">
          <h2>Комментарии и Отзывы</h2>
          <div className="comments-section">
            <h3>Оставить комментарий</h3>
            <div className="comment-form">
              <textarea
                placeholder="Напишите ваш комментарий или вопрос..."
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                className="btn btn--primary"
                onClick={handleAddComment}
                type="button"
              >
                Отправить комментарий
              </button>
            </div>

            <h3>Все комментарии ({comments.length})</h3>
            <div className="comments-list">
              {comments.map((c) => (
                <div className={`comment-item ${c.id === 2 ? "" : ""}`} key={c.id}>
                  <div className="comment-header">
                    <div className="comment-author-info">
                      <img src={c.avatar} alt="User Avatar" className="comment-avatar" />
                      <a href="#" className="comment-author">{c.author}</a>
                    </div>
                    <div className="comment-date">{c.date}</div>
                  </div>
                  <div className="comment-text">{c.text}</div>
                  <button className="reply-button">Ответить</button>

                  {/* если есть ответы — можно отрисовать вложенные */}
                  {c.id === 2 && (
                    <div className="replies">
                      <div className="comment-item nested">
                        <div className="comment-header">
                          <div className="comment-author-info">
                            <img src="/images/icons/ui/UserProfile.svg" alt="User Avatar" className="comment-avatar" />
                            <a href="#" className="comment-author">CodeMaster Pro Team</a>
                          </div>
                          <div className="comment-date">20 часов назад</div>
                        </div>
                        <div className="comment-text">Спасибо за ваш отзыв! Мы постоянно работаем над улучшением качества генерируемого кода и добавлением новых опций кастомизации. Следите за обновлениями!</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>

      <footer className="main-footer">
        <div className="container footer-container">
          <div className="footer-grid">
            <div className="footer-about">
              <div className="logo">
                <div className="logo-icon">
                  <img src="/images/logos/Bot.svg" alt="AI Market Logo" />
                </div>
                <span className="logo-title">AI Market</span>
              </div>
              <p className="footer-about-text">Лучший маркетплейс для аренды ИИ-агентов</p>
            </div>

            <div className="footer-links">
              <h3 className="footer-heading">Для клиентов</h3>
              <ul>
                <li><a href="#">Как арендовать</a></li>
                <li><a href="#">Гарантии</a></li>
                <li><a href="#">Поддержка</a></li>
              </ul>
            </div>

            <div className="footer-links">
              <h3 className="footer-heading">Для разработчиков</h3>
              <ul>
                <li><a href="#">Разместить агента</a></li>
                <li><a href="#">API документация</a></li>
                <li><a href="#">Комиссии</a></li>
              </ul>
            </div>

            <div className="footer-links">
              <h3 className="footer-heading">Компания</h3>
              <ul>
                <li><a href="#">О нас</a></li>
                <li><a href="#">Блог</a></li>
                <li><a href="#">Контакты</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-copyright">
            © 2025 AI Market. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
