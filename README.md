# Pengomat

Wichtel-o-mat mit Kater Peng. Zwei Links:

- **Für alle:** `https://<deine-seite>/`
- **Für die Gastgeberin:** `https://<deine-seite>/host/<HOST_KEY>`

## Lokal starten

```bash
npm install
```

```bash
HOST_KEY=test npm run dev
```

Ohne Datenbank merkt sich die Seite alles nur, solange der Server läuft. Host-Seite lokal: `http://localhost:3000/host/test`.

## Auf Vercel bringen

1. Projekt bei Vercel importieren (Framework: Next.js, keine weiteren Einstellungen).
2. Im Projekt unter **Storage** eine **Upstash Redis**-Datenbank aus dem Marketplace anlegen und mit dem Projekt verbinden. Die Zugangsdaten landen automatisch als Umgebungsvariablen im Projekt.
3. Unter **Settings → Environment Variables** `HOST_KEY` setzen (lang und zufällig – wer ihn kennt, ist Gastgeber) und optional `NEXT_PUBLIC_STIL` (`film` oder `sticker`).
4. Neu deployen.
5. **Einmal Probelauf machen:** auf der Host-Seite eintragen, zwei weitere Testnamen von anderen Geräten, auslosen, Geschenk schütteln. Danach unten auf der Host-Seite „Alles zurücksetzen".

Die Anbindung an Upstash ist gegen keine echte Datenbank getestet worden – der Probelauf in Schritt 5 ist deshalb Pflicht.

## Wie es abläuft

- Jede Person trägt Name und 1–3 Wünsche ein. Wünsche sieht nur, wer die Person zieht.
- Das Gerät merkt sich, wer man ist. Zusätzlich gibt es einen persönlichen Link für andere Geräte.
- Die Gastgeberin sieht am Kamin eine Socke pro Person (Name, Zeitpunkt, Anzahl Wünsche), legt das Budget fest und lost aus. Paarungen sieht auch sie nicht.
- Link verloren? Socke antippen → „Neuen persönlichen Link erzeugen" und weiterschicken.
- Nach der Auslosung erscheint beim Öffnen ein Geschenk: dreimal schütteln (Handy oder antippen).

## Bilder tauschen

- Peng: `public/peng/<film|sticker>/peng-<pose>.webp` (oder `.png`). Posen: `header`, `look`, `sleep`, `form`, `done`, `reveal`, `gift`, `nap`. Fehlt eine Pose, springt eine andere ein.
- Deko im Film-Look: `public/film/*.webp`.
- Neu aus den Original-Bögen erzeugen: siehe `scripts/` (`cut_film.py`, `upscale.py`, `build_film_assets.py`).

## Prüfen

```bash
npm test
```

```bash
npm run build && HOST_KEY=test-key npx next start -p 3111
```

```bash
node scripts/flow.cjs http://localhost:3111 film && node scripts/host.cjs http://localhost:3111 film
```
