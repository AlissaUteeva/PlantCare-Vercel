# PLANTCARE — сайт

Лендинг Android-приложения PLANTCARE для ухода за комнатными растениями.

Обычный статический сайт без сборки: `index.html`, `css/`, `js/`, `img/`.
Открыть локально: двойной клик по `index.html`.

- `js/plants-data.js` — база из 50 растений (копия `assets/plants.json` из приложения).
  Если обновили базу в приложении, пересоздайте файл: `window.PLANTS = <содержимое plants.json>;`
- Ссылка на анкету: `js/main.js`, строка `var SURVEY_URL = "";` — вставьте адрес формы, все кнопки «Пройти анкету» начнут вести на неё.
- Контакты и GitHub: в `index.html` найдите id="gh-link", id="contact-mail", id="contact-tg" и поставьте свои адреса.

Деплой: Vercel → Import Git Repository → Framework Preset **Other**, Build Command пусто, Output Directory пусто (корень).
