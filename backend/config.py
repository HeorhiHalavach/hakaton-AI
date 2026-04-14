from dotenv import load_dotenv
import os

load_dotenv(override=True)

api_key = os.getenv("AI_API_KEY")
api_url = os.getenv("AI_API_URL")

print("KEY IS OK")