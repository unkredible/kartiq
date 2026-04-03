import sqlite3

def inizializza_database():
    connessione = sqlite3.connect('telemetria.db')
    cursore = connessione.cursor()
    cursore.execute('''
        CREATE TABLE IF NOT EXISTS giri (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_gara TEXT NOT NULL,
            team TEXT NOT NULL,
            kart TEXT NOT NULL,
            tempo_giro TEXT NOT NULL,
            num_giro INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    connessione.commit()
    connessione.close()
    print("🏁 Database pronto.")

if __name__ == '__main__':
    inizializza_database()