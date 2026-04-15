import spacy
import re

class DataAnonymizer:
    def __init__(self):
        self.nlp = spacy.load("pl_core_news_md")

    def clean_text(self, text: str):

        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', '<EMAIL>', text)

        text = re.sub(r'(?<!\d)(?:\+?48[\s-]?)?(?:\d{3}[\s-]?\d{3}[\s-]?\d{3})(?!\d)', '<TELEFON>', text)

        doc = self.nlp(text)

        for ent in doc.ents:

            if ent.label_ in ["persName", "PERSON"]:
                text = text.replace(ent.text, "<OSOBA>")
            
            elif ent.label_ in ["placeName", "geogName", "LOC", "LOCATION", "GPE"]:
                text = text.replace(ent.text, "<MIEJSCE>")

        return text