# Architektura Systemu i Specyfikacja Techniczna

## 1. Wykorzystane Modele AI

System wykorzystuje hybrydową architekturę przetwarzania języka naturalnego (NLP), łączącą wyspecjalizowane modele lokalne z zaawansowanym modelem generatywnym.

### Bielik 11B V3.0 (API)
* **Typ:** Wielkogabarytowy model językowy (LLM) udostępniany przez API Organizatora.
* **Zastosowanie:** Generowanie kontekstowych, empatycznych odpowiedzi na podstawie analizy nastroju użytkownika.
* **Integracja:** Komunikacja odbywa się za pośrednictwem klienta OpenAI z wykorzystaniem dedykowanego adresu URL oraz klucza dostępu.

### bardsai/twitter-sentiment-pl-base (Lokalny)
* **Typ:** Model typu Transformer (architektura BERT) wyspecjalizowany w analizie sentymentu języka polskiego.
* **Zastosowanie:** Wyliczanie precyzyjnego wskaźnika nastroju (score) w skali 1.0 - 5.0 dla każdej przesłanej notatki.
* **Implementacja:** Wykorzystuje bibliotekę HuggingFace Transformers do lokalnego przetwarzania tekstu.

### pl_core_news_md (Lokalny)
* **Typ:** Model statystyczny NLP dla języka polskiego biblioteki spaCy.
* **Zastosowanie:** Rozpoznawanie encji nazwanych (NER) w celu identyfikacji danych wrażliwych takich jak imiona, nazwiska oraz lokalizacje geograficzne.

---

## 2. Biblioteki i Technologie

### Framework i API
* **FastAPI:** Asynchroniczny framework webowy służący do obsługi żądań HTTP i budowy punktów końcowych.
* **Uvicorn:** Serwer ASGI wykorzystywany do uruchamiania aplikacji.
* **Pydantic:** Walidacja struktur danych wejściowych i wyjściowych (modele DiaryEntry).

### Baza Danych i Persystencja
* **SQLAlchemy:** System ORM do zarządzania relacyjną bazą danych.
* **SQLite:** Lokalna baza danych (plik `diary.db`) przechowująca historię wpisów, wyniki analizy oraz odpowiedzi AI.

### Narzędzia Deweloperskie
* **Pytest:** Framework do automatyzacji testów jednostkowych i integracyjnych.
* **Python-dotenv:** Zarządzanie konfiguracją i kluczami API poprzez pliki środowiskowe.

---

## 3. Schemat Przepływu Danych (Data Flow)

Proces przetwarzania notatki użytkownika w punkcie końcowym `/api/analyze` przebiega według następującej sekwencji:

1. **Walidacja wejścia:** Serwer odbiera żądanie POST i weryfikuje poprawność formatu JSON przy użyciu modelu Pydantic.
2. **Anonimizacja (PII Redaction):**
   * Tekst trafia do modułu `DataAnonymizer`.
   * Wyrażenia regularne usuwają adresy e-mail oraz numery telefonów.
   * Model NER spaCy identyfikuje i maskuje imiona oraz miejsca, zastępując je tagami (np. `<OSOBA>`, `<MIEJSCE>`).
3. **Obliczanie wskaźnika nastroju:**
   * Zanonimizowany tekst jest dzielony na zdania.
   * Model sentymentu analizuje każde zdanie, a system wylicza średnią ważoną (Mood Score).
4. **Generowanie odpowiedzi AI:**
   * Oczyszczony tekst wraz z wyliczonym wynikiem nastroju jest przesyłany do modelu Bielik 11B.
   * System stosuje instrukcje systemowe (Prompt Engineering) w celu uzyskania krótkiej, empatycznej porady w języku polskim.
5. **Persystencja danych:** Oryginalny tekst, wynik punktowy oraz odpowiedź asystenta są zapisywane w bazie danych SQLite.
6. **Odpowiedź systemu:** Klient otrzymuje ustrukturyzowany obiekt JSON zawierający status operacji, wynik analizy oraz treść odpowiedzi AI.

---

## 4. Bezpieczeństwo i Walidacja

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

---

## 5. Testy i Walidacja Logiki Biznesowej

W celu zagwarantowania niezawodności i poprawności działania systemu, projekt zawiera kompleksowy zestaw testów automatycznych, podzielony na testy jednostkowe potoku NLP oraz testy integracyjne API.

### Testy Potoku Przetwarzania (Pipeline Tests)
Plik `tests.py` realizuje testy jednostkowe kluczowych komponentów biznesowych w izolacji od warstwy sieciowej (FastAPI).
* **Weryfikacja Anonimizacji:** Skrypt testuje różnorodne przypadki brzegowe (edge cases), wprowadzając celowo do systemu dane wrażliwe (np. imię "Anna", polski numer telefonu "+48795610431"). Następnie waliduje, czy w oczyszczonym tekście nie doszło do wycieku (PII Leak) przed przekazaniem danych do wyceny sentymentu.
* **Weryfikacja Sentymentu:** Skrypt przetwarza zdania o skrajnym ładunku emocjonalnym (pozytywne, negatywne, neutralne) w celu potwierdzenia, czy funkcja `get_fluid_score` poprawnie mapuje wyniki na oczekiwaną skalę 1.0 - 5.0.

### Testy Integracyjne API (Integration Tests)
Plik `test_api.py` zawiera zestaw testów integracyjnych opartych na frameworku `pytest` oraz narzędziu `TestClient` z biblioteki FastAPI.
* **Izolacja Środowiska (In-Memory DB):** Do celów testowych system wykorzystuje ulotną bazę danych w pamięci RAM (`sqlite:///:memory:`) ze wsparciem klasy `StaticPool`. Gwarantuje to, że uruchomienie testów nie nadpisuje i nie modyfikuje rzeczywistej bazy danych `diary.db`, a sesja jest współdzielona na czas trwania testu.
* **Mockowanie Zewnętrznych Zależności:** Aby wyeliminować opóźnienia sieciowe i koszty odpytywania zewnętrznego API (Bielik 11B), wywołania sztucznej inteligencji zostały zablokowane i zastąpione makietą przy użyciu dekoratora `@patch("main.process_user_note")` z biblioteki `unittest.mock`.
* **Scenariusze Testowe:**
  * `test_analyze_endpoint_success`: Weryfikacja poprawnego kodu odpowiedzi 200, struktury JSON oraz poprawnego zapisu do bazy.
  * `test_analyze_endpoint_empty_text` oraz `test_analyze_endpoint_symbols`: Badanie odporności punktu końcowego na anomalię wejściową (pusty ciąg znaków, wyłącznie znaki interpunkcyjne).
  * `test_weekly_statistics_endpoint` oraz `test_monthly_statistics_endpoint`: Weryfikacja poprawnego działania algorytmów agregujących dane historyczne i obliczających różnice stref czasowych.

### Instrukcja Uruchomienia Testów
Aby zwalidować poprawność działania całej logiki biznesowej, należy w katalogu `backend/` uruchomić polecenie:
```bash
pytest test_api.py
```
Testy potoku NLP uruchamia się natywnym poleceniem:
```bash
python tests.py
```

---

## 6. Instrukcja Uruchomienia Środowiska (Backend)

Poniższa instrukcja opisuje kroki niezbędne do poprawnego wdrożenia, konfiguracji i uruchomienia serwera aplikacji (backend) w środowisku lokalnym.

### Wymagania Wstępne
* Zainstalowany interpreter języka Python w wersji 3.10 lub nowszej (projekt zbudowany i testowany m.in. na środowisku 3.13).
* Narzędzie do zarządzania pakietami `pip`.

### Kroki Wdrożeniowe

**1. Przejście do katalogu roboczego i inicjalizacja środowiska wirtualnego**
Zaleca się ścisłą izolację zależności projektu. Przejdź do katalogu `backend/` i utwórz środowisko wirtualne (venv):

```bash
cd backend
python -m venv .venv
```

Systemy Windows: 

```bash
.venv\Scripts\activate
```

Systemy Linux / macOS: 
```bash
source .venv/bin/activate
```

**2. Instalacja zależności pakietowych**
Po aktywacji środowiska należy zainstalować wszystkie biblioteki wymagane do działania frameworka FastAPI, bazy danych oraz modeli sztucznej inteligencji:

```bash
pip install fastapi uvicorn pydantic sqlalchemy spacy openai transformers python-dotenv pytest httpx
```

**3. Pobranie lokalnych modeli NLP**
Moduł anonimizacji (NER) wymaga pobrania polskiego modelu statystycznego dla biblioteki spaCy. Należy wykonać poniższe polecenie:

```bash
python -m spacy download pl_core_news_md
```

**4. Konfiguracja zmiennych środowiskowych**
Do poprawnego połączenia z modelem Bielik 11B wymagana jest konfiguracja zmiennych środowiskowych. Wewnątrz katalogu backend/ upewnij się, że istnieje plik o nazwie .env. Plik ten musi zawierać klucze

**5. Uruchomienie serwera aplikacji**
Aplikacja jest obsługiwana przez serwer ASGI Uvicorn. Aby uruchomić backend w trybie deweloperskim z automatycznym przeładowaniem, należy wykonać komendę:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Weryfikacja działania**
Po pomyślnym uruchomieniu procesu:

### Serwer HTTP API będzie dostępny pod adresem: http://localhost:8000

### Interaktywna dokumentacja techniczna OpenAPI (Swagger UI), pozwalająca na testowanie punktów końcowych, zostanie automatycznie wygenerowana i udostępniona pod adresem: http://localhost:8000/docs

---

