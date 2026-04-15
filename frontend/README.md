# Frontend aplikacji

To jest frontendowa część aplikacji React + Vite, obsługująca interfejs użytkownika, dziennik, analizy nastroju oraz audio.

## Co jest w projekcie

- React 19 + Vite
- Tailwind CSS dla stylów
- kontekst aplikacji do zarządzania stanem (`src/context/AppDataContext.jsx`)
- api do komunikacji z backendem (`src/api/appApi.js`)
- zapisywanie `user_id` w `localStorage` dla unikalnego użytkownika
- responsywny dashboard, ciemny/jasny motyw i sekcja `Journal`

## Uruchomienie

1. Przejdź do katalogu `frontend`
2. Zainstaluj zależności:

```bash
npm install
```

3. Uruchom tryb deweloperski:

```bash
npm run dev
```

## Budowanie produkcyjne

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Konfiguracja API

Adres backendu możesz ustawić w pliku `.env` w katalogu `frontend` poprzez zmienną:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Backend oczekuje teraz:

- `GET /api/history?user_id=...`
- `GET /api/statistics/weekly?user_id=...`
- `GET /api/statistics/monthly?user_id=...`
- `POST /api/analyze` z ciałem `{ user_id, text }`
- `POST /api/speak` zwracającym plik audio

## Działanie `user_id`

Przy pierwszym uruchomieniu aplikacji generowany jest `diary_uid` i zapisywany w `localStorage`. Dzięki temu każdy użytkownik ma swoje dane osobne, a przy zmianie `localStorage.removeItem('diary_uid')` można przetestować nowego użytkownika.

## Główne pliki

- `src/App.jsx` — punkt wejścia aplikacji
- `src/context/AppDataContext.jsx` — logika stanu aplikacji i ładowanie danych
- `src/api/appApi.js` — wywołania API i logika requestów
- `src/components/Dashboard.jsx` — główny układ dashboardu
- `src/components/Journal.jsx` — obsługa dziennika i przycisków audio
- `src/components/StartDisplay.jsx` — ekran startowy przy ładowaniu

## Wsparcie tematu

Aplikacja ma tryb ciemny i jasny, ustawiony w `localStorage` pod kluczem `theme`. Dzięki temu preferencja użytkownika zostaje zapamiętana.

## Opis ekranów

- `Dashboard` — główny widok z podsumowaniem nastroju, liczbą notatek i ostatnimi wpisami. Tutaj widoczne są metryki takie jak „Dni z rzędu”, „Średni nastrój” oraz trend nastroju.
- `Journal` — formularz zapisu notatki oraz lista ostatnich wpisów. Przy każdym wpisie wyświetlana jest też odpowiedź AI, którą można odsłuchać.
- `Settings` — przełącznik motywu między `dark` a `light`.
- ekran startowy — animowany ekran ładowania, który wyświetla się na początku uruchomienia aplikacji.

## Jak działa odtwarzanie audio

- Kliknięcie `Odtwórz` wysyła tekst odpowiedzi na endpoint `POST /api/speak`.
- Backend zwraca plik audio jako `Blob`.
- Frontend tworzy `ObjectURL` i uruchamia element `Audio`.
- Przy odtworzeniu nowego nagrania poprzedni dźwięk jest zatrzymywany.

## Testowanie nowego użytkownika

Aby sprawdzić zachowanie jako nowy użytkownik, otwórz narzędzia deweloperskie w przeglądarce i wykonaj:

```js
localStorage.removeItem('diary_uid')
```

Następnie odśwież stronę. Aplikacja wygeneruje nowy identyfikator i załaduje dane dla „czystego” użytkownika.

## Uwagi

Plik `frontend/README.md` opisuje tylko frontend, więc jeśli potrzebujesz dokumentację backendu, sprawdź katalog `backend` lub główny README repozytorium.
