import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="container footer-container">
        <div className="footer-grid">
          <div className="footer-about">
            <div className="logo">
              <div className="logo-icon">
                <div className="icon-white">🤖</div>
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
  );
}