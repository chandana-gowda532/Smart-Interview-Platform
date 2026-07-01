from sqlalchemy import create_engine
from urllib.parse import quote_plus

password = quote_plus("Chandu@591")

DATABASE_URL = f"postgresql://postgres:{password}@localhost:5432/smart_interview"

engine = create_engine(DATABASE_URL)