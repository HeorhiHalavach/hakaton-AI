import os
from dotenv import load_dotenv
from openai import OpenAI
from anonymizer import DataAnonymizer

load_dotenv(override=True)

api_key = os.getenv("AI_API_KEY")
api_url = os.getenv("AI_API_URL")

print("KEY IS OK")

client = OpenAI(api_key=api_key, base_url=api_url)
anonymizer = DataAnonymizer()

def process_user_note(raw_text):
    clean_text = anonymizer.clean_text(raw_text)
    print(f"Текст после очистки: {clean_text}")

    response = client.chat.completions.create(
        model="bielik",
        messages=[
            {"role": "system", "content": "Analizuj nastrój użytkownika. Ignoruj tagi typu <OSOBA>."},
            {"role": "user", "content": clean_text}
        ]
    )
    return response.choices[0].message.content