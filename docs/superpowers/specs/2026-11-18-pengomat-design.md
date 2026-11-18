# Pengomat – Design

Stand: 2026-11-18

## Worum es geht

Der Pengomat ist eine kleine Wichtel-Webseite für ein privates Wichteln im
Freundes-/Familienkreis am **26.12.2026**. Kater Peng ist der Weihnachtswichtel
und das Gesicht der Seite. Die Seite soll sich wie eine gemütliche
Weihnachtsstube anfühlen – nicht wie ein generisches Formular-Tool.

Warum: Die Auslosung soll ein kleiner gemeinsamer Moment sein (Geschenk
schütteln, Überraschung), und niemand – auch nicht die Gastgeberin – soll
Wünsche oder Paarungen vorab sehen können.

## Ziele

- Teilnehmer tragen sich in unter einer Minute am Handy ein.
- Die Gastgeberin sieht auf einen Blick, wer dabei ist, und startet die
  Auslosung mit einem Knopf.
- Wünsche bleiben geheim: nur wer eine Person gezogen hat, sieht deren Wünsche.
- Die Enthüllung (Geschenk schütteln) macht Spaß und hat Sound.
- Optik: cozy, weihnachtlich, liebevoll illustriert, mit Peng.

## Nicht-Ziele

- Keine Konten, keine E-Mails, keine Passwörter.
- Nur ein einziges Wichtel-Event (keine Mehrfach-Runden, kein Archiv).
- Keine Ausschlussregeln („A darf B nicht ziehen").
- Keine Mehrsprachigkeit – alles auf Deutsch, Du-Form.

## Anti-Ziele (Scheitern, auch wenn es technisch läuft)

- Ein Wunsch oder eine Paarung ist für jemanden sichtbar, der sie nicht sehen
  darf (auch nicht über Browser-Netzwerk-Tab oder Host-Ansicht).
- Die Seite sieht nach Standard-KI-Frontend aus (lila Verläufe, Karten-Raster,
  Emoji als Deko statt echter Illustration).
- Jemand kommt nach der Auslosung nicht mehr an sein Ergebnis.

## Rahmenbedingungen

- Hosting auf Vercel, ein Projekt, ein Deployment.
- Zwei Links: Teilnehmer-Link (`/`) und Host-Link (`/host/<geheimer-schlüssel>`).
- Primär Handy (Hochformat), muss am Desktop ordentlich aussehen.
- Peng-Bilder liefert der Auftraggeber (extern generiert). Bis dahin
  Platzhalter; Bilder werden als Dateien ausgetauscht, ohne Code-Änderung.
- Keine urheberrechtlich geschützten Sounds/Musik: nur CC0/gemeinfrei oder
  selbst per Web Audio erzeugt.

## Ansätze

1. **Next.js (App Router) auf Vercel + Upstash Redis (Vercel Marketplace)** –
   *gewählt.* Seiten und kleine Server-Routen in einem Projekt; die Server-Routen
   entscheiden, wer was sehen darf. Kostenlos im Rahmen der Free-Tiers.
   Nachteil: einmalig Datenbank in Vercel anklicken und Umgebungsvariablen setzen.
2. **Statische Seite + Supabase/Firebase direkt aus dem Browser.** Weniger
   eigener Server-Code, aber die Geheimhaltung hängt dann an
   Datenbank-Regeln, die leicht falsch konfiguriert sind. Verworfen wegen des
   Anti-Ziels „Wunsch sichtbar".
3. **Reines Frontend ohne Speicher (alles in Links kodiert).** Kein Backend,
   aber die Gastgeberin könnte keine Liste sehen und keine zentrale Auslosung
   starten. Erfüllt die Anforderungen nicht.

Der Auftraggeber hat die technische Umsetzung dem Builder überlassen;
Ansatz 1 ist dessen Entscheidung.

## Ablauf und Phasen

Das Event hat zwei Phasen: **Anmeldung** → **Ausgelost**. Der Wechsel passiert
einmalig durch den Knopf der Gastgeberin und ist nicht umkehrbar.

### Teilnehmer-Seite (`/`)

Phase Anmeldung, noch nicht eingetragen:
- Kopf: Peng als Wichtel + Schriftzug „Pengomat" + Unterzeile (Vorschlag:
  „Peng lost aus. Du schenkst."), Countdown bis 26.12.2026, 00:00 Uhr
  Europe/Berlin (Tage/Stunden/Minuten/Sekunden).
- Budget gut sichtbar über dem Formular. Solange die Gastgeberin keins gesetzt
  hat: „Budget wird noch festgelegt".
- Formular: Name (Pflicht, 2–30 Zeichen), Wunsch 1 (Pflicht), Wunsch 2 und 3
  (optional, über „noch ein Wunsch" einblendbar), je max. 200 Zeichen.
  Hinweis: „Deinen Wunsch sieht nur, wer dich zieht."
- Absenden → Bestätigung mit Peng („Du bist dabei!"), plus persönlicher Link
  zum Kopieren/Teilen als Backup für Gerätewechsel.
- Ein Name, der schon vergeben ist (Groß/Klein egal), wird freundlich abgelehnt.

Phase Anmeldung, bereits eingetragen (Gerät erkannt):
- Bestätigungsansicht: „Du bist dabei, <Name>", eigene Wünsche sichtbar und
  bis zur Auslosung änderbar, Countdown, Hinweis „Peng lost bald aus".

Phase Ausgelost, eingetragen:
- Beim Öffnen erscheint das Geschenk (siehe Enthüllung).
- Nach der Enthüllung zeigt die Seite dauerhaft: gezogene Person, deren
  Wünsche, Budget, Countdown.

Phase Ausgelost, nicht eingetragen:
- „Die Auslosung ist schon gelaufen" – kein Formular mehr.

### Wiedererkennung

- Beim Eintragen erzeugt der Server ein zufälliges geheimes Token (≥128 Bit).
  Es wird im Browser gespeichert (localStorage) und steckt im persönlichen
  Link (`/?t=<token>`). Wer den Link öffnet, ist auf dem Gerät angemeldet.
- Kein Token → Seite verhält sich wie für neue Besucher.

### Host-Seite (`/host/<schlüssel>`)

- Schlüssel ist eine Umgebungsvariable (`HOST_KEY`); falscher Schlüssel → 404.
- Oben wie Teilnehmer-Seite inklusive Formular: die Gastgeberin trägt sich
  genau einmal selbst ein (gleicher Mechanismus, gleiche Geheimhaltung).
- Budget-Feld: frei eingebbarer Text (z. B. „15 €"), bis zur Auslosung änderbar.
- Runterscrollen: **Kamin-Szene**. Pro eingetragener Person hängt eine
  Socke mit Namen am Kaminsims (bricht bei vielen Personen in mehrere Reihen
  um; ausgelegt für ca. 3–20 Personen). Neue Socken erscheinen ohne Neuladen
  (Abfrage alle paar Sekunden).
- Klick auf eine Socke → kleines cozy Popup: Name, eingetragen am/um,
  „hat 2 Wünsche hinterlegt". Nie der Wunschtext. Vor der Auslosung
  zusätzlich „Entfernen" (mit Rückfrage) für Doppel-/Spaßeinträge.
- Knopf **„Auslosen"**: aktiv ab 3 Personen, mit Rückfrage („Sind alle da?
  Das lässt sich nicht rückgängig machen."). Danach zeigt die Host-Seite
  „Ausgelost am …" und die Gastgeberin bekommt wie alle ihr Geschenk.
- Die Gastgeberin sieht zu keinem Zeitpunkt Paarungen oder fremde Wünsche
  (außer die der Person, die sie selbst gezogen hat).

### Auslosung

- Zufällige Reihenfolge aller Teilnehmer, jeder beschenkt den Nächsten, der
  Letzte den Ersten (eine geschlossene Kette). Dadurch zieht niemand sich
  selbst und jeder wird genau einmal beschenkt.
- Zufall aus kryptografisch sicherer Quelle. Auslosung ist atomar: doppeltes
  Klicken oder zwei offene Host-Tabs erzeugen keine zweite Auslosung.

### Enthüllung

- Vollflächige Szene: ein illustriertes Geschenk, Aufforderung „Schüttel mich!".
- Schütteln zählt per Handy-Bewegung **oder** per Finger (Geschenk
  antippen/hin- und herziehen). Auf iPhones braucht Bewegungserkennung eine
  Erlaubnis nach einem Tipp – der erste Tipp aufs Geschenk fragt sie an;
  wird sie abgelehnt, funktioniert der Finger-Weg weiter.
- Drei Schüttler nötig. Jeder Schüttler: Wackel-Animation (jedes Mal etwas
  heftiger), Rappel-Sound, Fortschrittsanzeige (z. B. drei Glöckchen).
- Nach dem dritten: Deckel springt auf, Funkeln/Schnee, Karte kommt heraus:
  „Du beschenkst **<Name>**", Wünsche, Budget.
- Wurde schon enthüllt (im Browser gemerkt), zeigt die Seite das Ergebnis
  direkt, mit Knopf „Nochmal auspacken".
- `prefers-reduced-motion`: Animationen stark reduziert, Ablauf bleibt gleich.

## Ton

- Leise Weihnachtsmusik in Schleife + Soundeffekte (Rappeln, Aufploppen,
  Glöckchen beim Absenden).
- Browser erlauben Ton erst nach einer Berührung: Musik startet mit der ersten
  Interaktion, ein gut sichtbarer Ton-an/aus-Knopf bleibt immer erreichbar,
  Einstellung wird gemerkt.
- Quellen: CC0/gemeinfreie Dateien, lokal im Projekt abgelegt, Herkunft in
  einer `CREDITS`-Datei notiert. Wenn kein passendes Schüttelgeräusch zu
  finden ist, wird es per Web Audio synthetisiert.

## Look

- Hintergrund: Innenraum einer gemütlichen Weihnachtsstube – warmes Licht,
  Holz, Fenster mit Schneefall draußen, Girlande, kleine Deko, Socken.
  Auf der Host-Seite unten der Kamin mit flackerndem Feuer.
- Schriftzug „Pengomat" geschmückt (Tannengrün, Christbaumkugeln, Lichter).
- Dezente Dauer-Animationen: Schnee am Fenster, Lichterkette blinkt,
  Kugeln pendeln, Feuer flackert, Peng wippt leicht.
- **Stil (vom Auftraggeber gewählt): Sticker-Look.** Flache Farben, kräftige
  dunkle Konturen, weiche runde Formen, kleine Akzente (Sterne, Funkeln) –
  wie ein Sticker-Bogen. Die ganze Seite (Stube, Kamin, Socken, Geschenk,
  Schriftzug) wird in diesem Stil gebaut. Der Builder darf im Detail
  variieren. Peng: grau mit heller Brust, rote Mütze mit Glöckchen,
  Wichtel-Outfit; Posen: sitzend-zufrieden (Kopf), genervt liegend (Formular),
  jubelnd (Bestätigung), kullernd-lachend (Enthüllung).
- **Ton des Looks (Auftraggeber):** in erster Linie cozy, erst danach süß.
  Chibi/Sticker nur dosiert – warme, ruhige Stube, keine quietschbunte
  Sticker-Flut. Es machen auch Großeltern mit: große, gut lesbare Schrift
  (Fließtext ≥ 18 px), hoher Kontrast, große Tippflächen, klare Texte,
  ein Schritt nach dem anderen. Animationen schön, aber ruhig.
- Illustrationen der Szene als handgebaute SVGs; Peng als gelieferte Bilder.
- Peng-Bildplätze (transparenter Hintergrund, PNG/WebP): `peng-header`
  (Wichtel-Outfit, für den Kopf), `peng-form` (schaut übers Formular),
  `peng-done` (zufrieden, Bestätigung), `peng-reveal` (bei der Enthüllung).
  Liegt nur ein Bild vor, wird es an allen Plätzen verwendet.
- Die genaue visuelle Richtung (Farben, Schriften, Layout) wird im ersten
  Umsetzungsschritt als Design-Pass erarbeitet und dem Auftraggeber gezeigt,
  bevor die Funktionen gebaut werden. Auftraggeber-Wunsch: mit Design/Peng/
  Schriftzug anfangen; installierte Frontend-Skills und echte
  Weihnachtsseiten als Referenz heranziehen.

## Nachträge des Auftraggebers (während der Umsetzung)

- **Zwei Stile parallel:** Die Seite wird in zwei Looks gebaut, funktional
  und in den Animationen identisch: (a) Chibi-Sticker-Look, (b) cozy
  Animationsfilm-Look (weich, plastisch, warmes Licht – auch Socken, Kamin,
  Hintergrund). Umschaltbar zum Vergleichen; am Ende wird einer Standard.
- **Idee für später (noch nicht umsetzen):** Blick von oben auf einen
  weihnachtlichen Tisch; das Formular liegt dort als Schriftrolle, daneben
  Kekse etc. Nach dem Abschicken schwenkt die „Kamera" vom Tisch nach oben
  auf Weihnachtsbaum und Socken, dort steht der Countdown.
- Animationen für jeden Schritt, z. B. Peng reagiert, wenn das Formular
  abgeschickt wurde.

## Entscheidungen des Builders nach Gegenlesen (vom Auftraggeber zu prüfen)

- **Link verloren:** Im Socken-Popup gibt es „Neuen persönlichen Link
  erzeugen". Das alte Token wird ungültig, die Gastgeberin schickt den neuen
  Link weiter. Das Ergebnis wird ihr dabei nicht angezeigt. Bewusster
  Kompromiss: Sie könnte den Link theoretisch selbst öffnen – das ist
  Vertrauenssache, dafür kommt jeder sicher an sein Ergebnis. Kein
  Anmelden nur per Name (zu leicht zu missbrauchen).
- **Design-Pass ist ein harter Stopp:** Zuerst entsteht die Teilnehmer-Seite
  als reine Optik (Kopf mit Peng-Platzhalter, Schriftzug, Stube, Formular ohne
  Funktion) plus Kamin-Szene. Der Auftraggeber bekommt Screenshots (Handy und
  Desktop) einer Richtung und gibt frei, bevor Server und Abläufe gebaut werden.
- **Gastgeberin muss nicht teilnehmen:** Die Auslosung ist nicht daran
  gebunden. „Genau einmal" heißt: gleiche Regel wie für alle (ein Eintrag pro
  Gerät/Token, Name nur einmal).
- **Probelauf:** Die Host-Seite hat unten unauffällig „Alles zurücksetzen"
  (doppelte Rückfrage, Eintippen von „PENG"). Löscht Teilnehmer, Auslosung und
  setzt die Phase zurück; Budget bleibt. So lässt sich der ganze Ablauf vorab
  testen.

## Daten und Schnittstellen

Gespeichert (Redis):
- Event: Budget-Text, Phase, Zeitpunkt der Auslosung.
- Teilnehmer: ID, Name, Wünsche (1–3), Zeitpunkt, Token (nur als Hash),
  nach Auslosung: ID der zu beschenkenden Person.

Server-Routen (Namen dem Builder überlassen), Regeln sind bindend:
- Öffentlicher Status: Phase, Budget, Event-Datum. Keine Namen.
- Eintragen: Name + Wünsche → Token. Nur in Phase Anmeldung.
- „Ich": mit Token → eigener Name, eigene Wünsche; nach Auslosung zusätzlich
  Name + Wünsche der gezogenen Person. Wünsche ändern nur vor Auslosung.
- Host (nur mit Schlüssel): Liste mit Name, Zeitpunkt, Anzahl Wünsche;
  Budget setzen; Teilnehmer entfernen (nur vor Auslosung); auslosen.
  Host-Antworten enthalten nie Wunschtexte, Tokens oder Paarungen.
- Einfache Eingabe-Prüfung und Begrenzung (Längen, max. 50 Teilnehmer).

## Tests

- Auslosung: niemand zieht sich selbst, jeder genau einmal Geber und
  Empfänger, für 3–50 Personen, mehrfach wiederholt.
- Geheimhaltung: Host-Antworten ohne Wunschtext/Paarung; „Ich"-Antwort vor
  Auslosung ohne fremde Daten; falsches Token/falscher Schlüssel abgewiesen.
- Phasen: Eintragen/Ändern/Entfernen nach Auslosung abgelehnt; zweite
  Auslosung ohne Wirkung.
- Ein Durchlauf im echten Browser (Eintragen → Host lost aus → Enthüllung)
  im Handy-Format, mit Screenshots.

## Dem Builder überlassen

- Animationsbibliothek, CSS-Ansatz, Dateistruktur, Routennamen.
- Genaue Texte (im Ton: warm, kurz, leicht verschmitzt).
- Konkrete Musik-/Sound-Dateien innerhalb der Lizenzregel.
- Lokale Entwicklung ohne Redis (z. B. In-Memory-Ersatz).

## Was der Auftraggeber am Ende selbst tun muss

- Projekt bei Vercel anlegen, Upstash Redis aus dem Marketplace verbinden,
  `HOST_KEY` setzen. Eine kurze Schritt-für-Schritt-Anleitung liegt im README.
- Peng-Bilder liefern.
