import os
from anonymizer import DataAnonymizer
from ai_core import get_fluid_score 

def run_pipeline_tests():
    print("Inicjalizacja środowiska testowego...")
    anonymizer = DataAnonymizer()

    test_texts = [
        "To był genialny dzień! Wszystko się udało i jestem mega szczęśliwy.",
        "Tragedia. Wszystko się wali, mam dość tego dnia i chcę tylko spać.",
        "Dzisiaj jestem nie wyspany, ale w końcu dzień nie jest taki trudny. Było wesoło.",
        "Fatalnie zacząłem poranek, zadzwoniła mi Anna, jej numer telefonu +48795610431. Ale obiad był pyszny.",
        "Zwykły dzień. Robiłem zakupy, sprzątałem mieszkanie. Nic nowego."
    ]

    print("\n" + "="*60)
    print("URUCHOMIENIE TESTÓW: ANONIMIZACJA ➔ ANALIZA SENTYMENTU")
    print("="*60)

    for i, raw_text in enumerate(test_texts, 1):
        print(f"\n--- TEST NR {i} ---")
        print(f"ORYGINAŁ: {raw_text}")
        
        clean_text = anonymizer.clean_text(raw_text)
        print(f"OCZYSZCZONO:  {clean_text}")
        
        score = get_fluid_score(clean_text)
        print(f"WYNIK NLP: {score:.2f} / 5.0")
        
        if "Anna" in clean_text or "+48" in clean_text:
            print("UWAGA: Wyciek danych osobowych!")
        else:
            print("Anonimizacja zadziałała bezbłędnie.")

if __name__ == "__main__":
    run_pipeline_tests()