from flask import Flask, render_template, request, redirect, session, jsonify
import urllib.request
import json
import ssl
import sqlite3
import traceback

app = Flask(__name__)
app.secret_key = "super_segreto_strategia_kart" 
PASSWORD_ACCESSO = "0000"

SOGLIA_PIT = 2.2 

DATI_MASTER_LIST = [
    {"id": 48, "name": "KART CIRCUITO PALAZZO", "n_races": 2},
    {"id": 47, "name": "EXTREMA kart", "n_races": 30},
    {"id": 45, "name": "PRO 022 Chrono", "n_races": 30},
    {"id": 44, "name": "Karting Sicilia", "n_races": 30},
    {"id": 39, "name": "PISTA WINNER", "n_races": 24},
    {"id": 43, "name": "Tazio Nuvolari", "n_races": 2},
    {"id": 37, "name": "Go-Kart Rozzano", "n_races": 30},
    {"id": 15, "name": "PRO 022 Chrono - 2", "n_races": 30},
    {"id": 2, "name": "PRO 022 Chrono", "n_races": 30},
    {"id": 9, "name": "CRONOCORSE - 2", "n_races": 21},
    {"id": 32, "name": "Minimoto", "n_races": 2}
]

def to_seconds(t_str):
    try:
        t_str = str(t_str).strip()
        if ":" in t_str:
            parts = t_str.split(":")
            return int(parts[-2]) * 60 + float(parts[-1])
        return float(t_str)
    except: return 0

def format_kart_time(time_val):
    if not time_val or time_val == "00:00:00.000": return "--.---"
    try:
        parts = str(time_val).split(":")
        m, s_ms = parts[-2], parts[-1][:6]
        return f"{int(m)}:{s_ms}" if int(m) > 0 else s_ms
    except: return str(time_val)

# --- IL FIX DEFINITIVO (URL Codificato + Identificazione KART) ---
def sincronizza_gara_completa(id_gara):
    print(f"\n[SYNC] 🚀 Download globale per gara {id_gara}...")
    
    # URL con le parentesi trasformate in %5B e %5D per far felice il server Time2Race
    url_encoded = (
        f"https://api-stg.mk.time2race.it/api/public/laps/"
        f"?format=datatables&start=0&length=9999"
        f"&columns%5B0%5D%5Bdata%5D=race&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D={id_gara}"
    )
    
    try:
        req = urllib.request.Request(url_encoded, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ssl._create_unverified_context()) as response:
            dati = json.loads(response.read().decode('utf-8'))
            laps_list = dati.get("data", [])
            print(f"[SYNC] 📦 BOOM! Server ha risposto. {len(laps_list)} giri trovati.")

            conn = sqlite3.connect('telemetria.db')
            cur = conn.cursor()
            nuovi = 0

            for lap in laps_list:
                team = str(lap.get("drivername") or lap.get("participantname") or "Sconosciuto").strip()
                kart = str(lap.get("raceno", "")).strip()
                num_giro = lap.get("lapno")
                tempo = format_kart_time(lap.get("laptime"))

                # Usiamo il KART come identificatore primario invece del team
                if kart and num_giro:
                    cur.execute("SELECT id FROM giri WHERE id_gara=? AND kart=? AND num_giro=?", (id_gara, kart, num_giro))
                    if cur.fetchone() is None:
                        cur.execute("INSERT INTO giri (id_gara, team, kart, tempo_giro, num_giro) VALUES (?, ?, ?, ?, ?)", 
                                    (id_gara, team, kart, tempo, num_giro))
                        nuovi += 1
            
            conn.commit()
            conn.close()
            print(f"[SYNC] ✅ DB aggiornato: {nuovi} giri inseriti!\n")
            return True
            
    except Exception as e:
        print(f"[SYNC] ❌ Errore: {e}")
        return False

@app.route('/')
def home():
    if 'loggato' in session: return redirect('/dashboard')
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    if request.form.get('password') == PASSWORD_ACCESSO:
        session['loggato'] = True
        return redirect('/dashboard')
    return "Password Errata.", 403

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/dashboard')
def dashboard():
    if 'loggato' not in session: return redirect('/')
    return render_template('dashboard.html')

@app.route('/api/sessione')
def api_sessione():
    return jsonify({"id_circuito": session.get('id_circuito'), "id_gara": session.get('id_gara')})

@app.route('/api/circuiti')
def api_circuiti():
    return jsonify({str(p["id"]): f"{p['name']} ({p['n_races']} gare)" for p in DATI_MASTER_LIST})

@app.route('/api/gare_circuito/<id_circuito>')
def api_gare_circuito(id_circuito):
    url = f"https://api-stg.mk.time2race.it/api/public/races/?format=datatables&columns%5B0%5D%5Bdata%5D=endrace&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=true&columns%5B1%5D%5Bdata%5D=subscription_id&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D={id_circuito}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ssl._create_unverified_context()) as response:
            data = json.loads(response.read())
            return jsonify([{"id_gara": str(g["id"]), "nome": f"Turno {g['runname']} ({g['date_created'][:10]})"} for g in data.get("data", [])])
    except: return jsonify([])

@app.route('/api/imposta_gara', methods=['POST'])
def imposta_gara():
    dati = request.json
    session['id_circuito'] = dati.get('id_circuito')
    session['id_gara'] = dati.get('id_gara')
    sincronizza_gara_completa(session['id_gara'])
    return jsonify({"status": "ok"})

@app.route('/api/live_data')
def api_live_data():
    id_g = session.get('id_gara')
    if not id_g: return jsonify([])
    
    url = f"https://api-stg.mk.time2race.it/api/public/races/{id_g}/ranking/?format=datatables"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ssl._create_unverified_context()) as response:
            dati = json.loads(response.read())
            results = []
            conn = sqlite3.connect('telemetria.db')
            cur = conn.cursor()
            
            for p in dati.get("data", []):
                team_orig = p.get("fullname", "Sconosciuto")
                kart = str(p.get("raceno", "")).strip()
                best_sec = to_seconds(p.get("besttime"))
                try: laps = int(p.get("laps", 0))
                except: laps = 0
                last_time_str = format_kart_time(p.get("lasttime"))

                # Salvataggio live basato sul KART
                if laps > 0 and last_time_str != "--.---" and kart:
                    cur.execute("SELECT id FROM giri WHERE id_gara=? AND kart=? AND num_giro=?", (id_g, kart, laps))
                    if cur.fetchone() is None:
                        cur.execute("INSERT INTO giri (id_gara, team, kart, tempo_giro, num_giro) VALUES (?, ?, ?, ?, ?)", 
                                    (id_g, team_orig, kart, last_time_str, laps))
                        conn.commit()

                # Conta i pit basandosi sul KART
                cur.execute("SELECT tempo_giro FROM giri WHERE id_gara=? AND kart=?", (id_g, kart))
                giri_db = cur.fetchall()
                pit_count = sum(1 for g in giri_db if to_seconds(g[0]) > (best_sec * SOGLIA_PIT) and best_sec > 0)
                
                results.append({
                    "id_gara": id_g, "kart": kart, "team": team_orig, "laps": laps,
                    "lastTime": last_time_str, "bestTime": format_kart_time(p.get("besttime")),
                    "pit": pit_count, "diff": p.get("difference"), "gap": p.get("gap"),
                    "total": format_kart_time(p.get("totaltime")), "inLap": p.get("bestinlap")
                })
            conn.close()
            return jsonify(results)
    except Exception as e:
        traceback.print_exc()
        return jsonify([])

# --- MODIFICA ROTTE: ORA USIAMO IL KART! ---
@app.route('/kart_detail/<id_gara>/<kart>')
def kart_detail(id_gara, kart):
    if 'loggato' not in session: return redirect('/')
    return render_template('kart_detail.html', id_gara=id_gara, kart=kart)

@app.route('/api/storico_kart/<id_gara>/<kart>')
def api_storico_kart(id_gara, kart):
    kart_search = str(kart).strip()
    conn = sqlite3.connect('telemetria.db')
    cur = conn.cursor()
    
    # Ricerca PURA per numero di Kart (infallibile)
    cur.execute("SELECT num_giro, tempo_giro, team FROM giri WHERE id_gara=? AND kart=? ORDER BY num_giro DESC", (id_gara, kart_search))
    rows = cur.fetchall()
    conn.close()
    
    times = [to_seconds(r[1]) for r in rows if to_seconds(r[1]) > 0]
    best = min(times) if times else 0
    history = []
    
    # Prendiamo il nome del team dall'ultima registrazione per mostrarlo in cima
    nome_team_trovato = rows[0][2] if rows else f"Kart {kart}"

    for r in rows:
        sec = to_seconds(r[1])
        status = "normale"
        if best > 0:
            if sec > best * SOGLIA_PIT: status = "pit"
            elif sec > best * 1.15: status = "anomalia"
        history.append({"lap": r[0], "time": r[1], "status": status})
        
    return jsonify({"team": nome_team_trovato, "giri": history})

if __name__ == '__main__':
    app.run(debug=True, port=5000)