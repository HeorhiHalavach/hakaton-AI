    import os
    from dotenv import load_dotenv

    load_dotenv()

    api_key = os.getenv("AI_API_KEY")
    api_url = os.getenv("AI_API_URL")

    print("KEY IS OK")