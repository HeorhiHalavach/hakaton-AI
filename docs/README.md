# Aplikacja Nawigator Umysłu

Pełny stos aplikacji: frontend React + Vite oraz backend FastAPI.
Aplikacja pozwala na zapis nastroju, analizę wpisów przez AI, historię notatek, raporty tygodniowe i miesięczne oraz odtwarzanie odpowiedzi jako dźwięk.

---

## 🏗️ Architektura systemu

- Backend oparty na FastAPI.
- Baza danych SQLite zarządzana przez SQLAlchemy (`backend/database.py`).
- Moduł anonimizacji danych wrażliwych: `backend/anonymizer.py`.
- Model AI do analizy nastroju i generowania odpowiedzi:
  - lokalny pipeline sentiment-analysis od Hugging Face z modelem `bardsai/twitter-sentiment-pl-base`.
  - zewnętrzne zapytania do modelu `bielik` przez klienta OpenAI w `backend/ai_core.py`.
- Frontend React/Vite z Tailwind CSS i kontekstem stanu w `frontend/src/context/AppDataContext.jsx`.

---

## 🔧 Struktura repozytorium

- `frontend/` — React + Vite, Tailwind CSS, logika UI i komunikacja z backendem.
- `backend/` — FastAPI, baza danych SQLAlchemy, przetwarzanie wpisów i TTS audio.
- `MAIN_TASK.md` — główne zadanie hackathonowe.
- `examples/` — przykładowe fragmenty kodu lub wykorzystania.

---

## 🚀 Uruchomienie projektu

### Frontend

1. Przejdź do katalogu `frontend`:

```bash
cd frontend
```

2. Zainstaluj zależności:

```bash
npm install
```

3. Uruchom wersję deweloperską:

```bash
npm run dev
```

4. Budowanie produkcyjne:

```bash
npm run build
```

5. Sprawdzanie lintera:

```bash
npm run lint
```

6. Konfiguracja backendu:

Ustaw `VITE_API_BASE_URL` w pliku `frontend/.env`, np.:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend

1. Przejdź do katalogu `backend`:

```bash
cd backend
```

2. Utwórz wirtualne środowisko (opcjonalnie):

Windows:
```bash
python -m venv .venv
.\.venv\Scripts\activate
```
Linux / macOS:
```bash
python -m venv .venv
source .venv/bin/activate
```

3. Zainstaluj zależności:

```bash
python -m pip install fastapi uvicorn sqlalchemy edge-tts pydantic
```

4. Uruchom serwer:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📌 Główne funkcje

- Analiza nastroju wpisów użytkownika.
- Historia notatek z AI-odpowiedziami.
- Raporty statystyczne:
  - `GET /api/statistics/weekly`
  - `GET /api/statistics/monthly`
- Odtwarzanie odpowiedzi głosowej za pomocą TTS (`POST /api/speak`).
- Przechowywanie identyfikatora użytkownika w `localStorage`.
- Tryb jasny / ciemny oraz responsywny interfejs.

---

## 🧠 Backend API

Backend obsługuje następujące endpointy:

- `POST /api/analyze`
  - Request: `{ user_id, text }`
  - Analizuje wpis i zapisuje go w bazie.
- `GET /api/history?user_id=<id>`
  - Pobiera historię notatek dla konkretnego użytkownika.
- `GET /api/statistics/weekly?user_id=<id>`
  - Pobiera listę wpisów z ostatnich 7 dni.
- `GET /api/statistics/monthly?user_id=<id>`
  - Pobiera dane z ostatnich 30 dni.
- `POST /api/speak`
  - Request: `{ text }`
  - Zwraca plik audio MP3 wygenerowany przez `edge_tts`.
- `DELETE /api/clear`
  - Czyści wszystkie wpisy w bazie (przydatne w testach / dewelopmencie).

---

## Bezpieczeństwo i Walidacja

System został zaprojektowany z rygorystycznym podejściem do higieny danych (Data Hygiene) oraz ochrony prywatności użytkowników, wykorzystując wielowarstwowe mechanizmy zabezpieczeń.

### Identyfikacja i Usuwanie PII (Data Anonymization)
Zanim jakiekolwiek dane tekstowe zostaną przesłane do zewnętrznego API modelu Bielik, przechodzą one przez rygorystyczny proces sanitaryzacji w module `DataAnonymizer`.
* **Wzorcowe dopasowanie (Regex):** System wykorzystuje wyrażenia regularne do natychmiastowego wyłapywania i maskowania formatów takich jak adresy e-mail (zastępowane tagiem `<EMAIL>`) oraz numery telefonów, w tym kierunkowe +48 (zastępowane tagiem `<TELEFON>`).
* **Rozpoznawanie Encji Nazwanych (NER):** Przy użyciu modelu `pl_core_news_md` biblioteki spaCy, system analizuje kontekst zdania w celu wykrycia imion i nazwisk (zastępowanych tagiem `<OSOBA>`) oraz nazw geograficznych i lokalizacji (zastępowanych tagiem `<MIEJSCE>`).
* **Izolacja danych:** Wrażliwe dane osobowe nigdy nie opuszczają lokalnego serwera i nie są uwzględniane w logach przesyłanych do zewnętrznych dostawców LLM.

### Walidacja Typów Wejściowych i Wykrywanie Anomalii
* **Ścisłe schematy Pydantic:** Każde żądanie HTTP do punktu końcowego `/api/analyze` jest automatycznie walidowane przez framework FastAPI w oparciu o model danych `DiaryEntry`.
* **Odrzucanie anomalii:** Jeśli ładunek (payload) żądania nie zawiera wymaganego pola tekstowego lub typ danych jest niezgodny (np. przesłano wartość pustą lub liczbową zamiast ciągu znaków), serwer automatycznie odrzuca zapytanie, zwracając błąd HTTP 422 (Unprocessable Entity). Zapobiega to wprowadzaniu tzw. brudnych danych (data hygiene) do potoku analizy.

### Obsługa Błędów i Ochrona Infrastruktury
* **Bezpieczeństwo zapytań SQL:** Komunikacja z bazą danych SQLite odbywa się wyłącznie za pośrednictwem warstwy abstrakcji ORM (SQLAlchemy). Dzięki temu zapytania są parametryzowane, co natywnie chroni system przed atakami typu SQL Injection.
* **Kontrolowane wyjątki:** Wszystkie punkty końcowe API są zabezpieczone blokami `try-except`. W przypadku wystąpienia nieoczekiwanego błędu po stronie serwera lub modeli AI, system przechwytuje wyjątek i zwraca ustandaryzowaną odpowiedź JSON `{"status": "error", "message": "..."}`, zapobiegając w ten sposób wyciekom śladów stosu (stack traces) do klienta.

## 📁 Kluczowe pliki

### Frontend

- `frontend/src/App.jsx` — główny punkt wejścia aplikacji.
- `frontend/src/context/AppDataContext.jsx` — zarządzanie stanem aplikacji, ładowanie historii i statystyk.
- `frontend/src/api/appApi.js` — wywołania API i dodawanie `user_id` do żądań.
- `frontend/src/components/Dashboard.jsx` — widok dashboardu i statystyk.
- `frontend/src/components/Journal.jsx` — formularz wpisu, lista notatek oraz przycisk audio.
- `frontend/src/components/StartDisplay.jsx` — ekran startowy i animowany wstęp.

### Backend

- `backend/main.py` — serwer FastAPI i definicje endpointów.
- `backend/ai_core.py` — logika analizy tekstu i generowania odpowiedzi AI.
- `backend/database.py` — konfiguracja połączenia z bazą i model `DiaryEntryDB`.

---

## 🧩 Mechanizm `user_id`

Frontend generuje unikalny identyfikator użytkownika i zapisuje go w `localStorage` pod kluczem `diary_uid`.
Dzięki temu backend zapisuje osobne dane dla każdego użytkownika oraz ładuje jego historię i statystyki.

---

## 🎧 Odtwarzanie audio

- Frontend wysyła tekst z odpowiedzią AI do `/api/speak`.
- Backend generuje plik MP3 przy użyciu `edge_tts`.
- Frontend pobiera plik jako `Blob`, tworzy `ObjectURL` i odtwarza go w `Audio`.
- Przy odtworzeniu nowego dźwięku poprzednie audio jest automatycznie zatrzymywane.

---

## 🧪 Testy

- Plik `backend/tests.py` zawiera testy jednostkowe i integracyjne dla logiki backendu oraz punktów końcowych API.
- Testy pokrywają podstawowe przypadki użycia, m.in.:
  - analizę nowego wpisu,
  - pobieranie historii użytkownika,
  - wygenerowanie statystyk tygodniowych i miesięcznych.
- Weryfikacja poprawności logiki biznesowej odbywa się poprzez symulację żądań HTTP i sprawdzenie odpowiedzi JSON.

---

## 📚 Dodatkowe informacje

- `frontend/README.md` zawiera bardziej szczegółową dokumentację frontendową.
- `MAIN_TASK.md` zawiera główne założenia hackathonowe i zadania zespołu.
- `backend/` może wymagać dodatkowych bibliotek w zależności od środowiska systemowego.

---

## ✅ Notatka

Zaktualizowano ten plik, aby zastąpić ogólny szablon hackathonowy rzeczywistą dokumentacją pełno-stackowego projektu.
