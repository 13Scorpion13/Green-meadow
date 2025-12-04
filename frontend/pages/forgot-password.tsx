 import { useState } from 'react';
 import Link from 'next/link';
 
 export default function ForgotPasswordPage() {
   const [email, setEmail] = useState('');
   const [message, setMessage] = useState('');
   const [error, setError] = useState('');
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setMessage('');
     setError('');
 
     // Здесь будет вызов к бэкенду для запроса сброса пароля
     // Пока что просто имитируем отправку и показываем сообщение
     try {
       // Имитация API-вызова
       console.log('Запрос сброса пароля для:', email);
       await new Promise(resolve => setTimeout(resolve, 1500)); // Имитация задержки сети
 
       // Предположим, что бэкенд всегда возвращает успешный ответ (для текущей реализации фронтенда)
       setMessage('Если аккаунт с таким email существует, ссылка для сброса пароля отправлена на ваш адрес.');
       setEmail(''); // Очищаем поле email после отправки
     } catch (err) {
       console.error('Ошибка при запросе сброса пароля:', err);
       setError('Произошла ошибка при отправке запроса. Пожалуйста, попробуйте еще раз.');
     }
   };
 
   return (
     <div className="auth-container">
       <div className="account-card account-card--center">
         <h2 className="account-title--big">Сброс пароля</h2>
 
         {message && <p className="form-success">{message}</p>}
         {error && <p className="form-error">{error}</p>}
 
         {!message && ( // Показываем форму, только если сообщение об успехе еще не показано
           <form onSubmit={handleSubmit} className="profile-form">
             <div className="form-group">
               <label className="form-label">Email</label>
               <input
                 type="email"
                 className="form-input"
                 placeholder="Введите ваш email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
 
             <div className="form-actions">
               <Link href="/login" className="btn">Отменить</Link>
               <button type="submit" className="btn btn--primary">Отправить</button>
             </div>
           </form>
         )}
        
        <div className="auth-card-footer">
           <Link href="/login">Вернуться ко входу</Link>
        </div>
       </div>
     </div>
   );
 }