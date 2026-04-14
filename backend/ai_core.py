import re
from openai import OpenAI
from transformers import pipeline
from main import api_url, api_key
from anonymizer import DataAnonymizer

client = OpenAI(api_key=api_key, base_url=api_url)
anonymizer = DataAnonymizer()

nlp_model = pipeline("sentiment-analysis", model="bardsai/twitter-sentiment-pl-base", top_k=None)




def get_fluid_score(text):
    sentences = re.split(r'(?<=[.!?,])\s+', text.strip())
    if not sentences: sentences = [text]

    sentence_scores = []
    for sentence in sentences:
        if len(sentence) < 2: continue
        result = nlp_model(sentence)[0]
        scores = {item['label']: item['score'] for item in result}

        balance = (scores.get('positive', 0) * 1.0) - (scores.get('negative', 0) * 2.35)
        s_score = 3.0 + (balance * 2.0)
        sentence_scores.append(max(1.0, min(5.0, s_score)))

    if not sentence_scores: return 3.0
    return sum(sentence_scores) / len(sentence_scores)



def process_user_note(raw_text):
    clean_text = anonymizer.clean_text(raw_text)

    mood_score = get_fluid_score(clean_text)


    system_prompt = f"""Jesteś empatycznym asystentem zdrowia psychicznego. 
Twoja analiza nastroju dla tego wpisu to: {mood_score:.2f}/5.

Zasady:
1. Odpowiedz krótko i po polsku (max 3 zdania).
2. Jeśli wynik jest niski (< 2.5), bądź bardzo wspierający.
3. Jeśli wynik jest średni, doceń wysiłek użytkownika.
4. Jeśli wynik jest wysoki, zmotywuj użytkownika na nowe zwycięstwa.
5. Nie oceniaj, po prostu rozmawiaj.
Ignoruj w tekście wszelkie tagi anonimizacji (np. <OSOBA>)."""

    response = client.chat.completions.create(
        model="bielik",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": clean_text}
        ],
        temperature=0.7
    )

    bielik_reply = response.choices[0].message.content
    bielik_reply = bielik_reply.replace("### Odpowiedź:", "").replace("###", "").strip()

    return {
        "original_text": raw_text,
        "clean_text": clean_text,
        "score": round(mood_score, 2),
        "response": bielik_reply
    }
test_texts = [
    "To był genialny dzień! Wszystko się udało i jestem mega szczęśliwy.",

    "Tragedia. Wszystko się wali, mam dość tego dnia и chcę tylko spać.",

    "Dzisiaj jestem nie wyspany, ale w końcu dzień nie jest taki trudny. Było wesoło.",

    "Fatalnie zacząłem poranek, zadzwoniła mi Anna, jej numer telefonu +48795610431 spóźniłem się na autobus. Ale obiad był pyszny.",

    "Zwykły dzień. Robiłem zakupy, sprzątałem mieszkanie. Nic nowgo.",

    "Wszystko w porządku, ale jakoś tak mi smutno bez powodu.",

"Dzisiaj rano czułem się fatalnie, po prostu nie miałem siły wstać z łóżka. Potem jednak wypiłem mocną kawę i słońce zaczęło świecić przez okno, co trochę poprawiło mi humor. W pracy było średnio, szef znowu marudził, ale przynajmniej skończyłem ważny projekt przed czasem. Wieczorem czuję się zmęczony, ale w sumie dumny z siebie. Mam nadzieję, że jutro będzie jeszcze lepiej, choć lęk przed przyszłością wciąż gdzieś tam siedzi."
]
for text in test_texts:
    result = process_user_note(text)

    print(f"Wynik NLP: {result['score']} / 5")
    print(f"Bielik mówi:\n{result['response']}")
