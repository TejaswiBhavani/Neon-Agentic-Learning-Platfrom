import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to default 'postgres' database
conn = psycopg2.connect(
    user="postgres",
    password="root123",
    host="localhost",
    port="5433",
    database="postgres"
)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

cursor = conn.cursor()
db_name = "ai_learning_system"

# Check if database exists
cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
exists = cursor.fetchone()

if not exists:
    print(f"Creating database {db_name}...")
    cursor.execute(f"CREATE DATABASE {db_name}")
    print("Database created successfully!")
else:
    print(f"Database {db_name} already exists.")

cursor.close()
conn.close()
