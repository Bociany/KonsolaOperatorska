# Konsola Operatorska

Na potrzebę tego problemu, wykonaliśmy aplikację sieciową.
Korzystając z biblioteki do obsługi map Leaflet, map dostarczonych przez OpenStreetMaps oraz jQuery, zbudowaliśmy aplikację, która w czasie rzeczywistym pokazuje obecne położenie urządzeń.

Za wygląd, CSS i HTML odpowiadają: Aleksander Brzykcy, Dawid Mularczyk, Mateusz Łoziński, Piotr Łaba.
Za kod: Kacper Staroń.

# Schemat działania

**Po załadowaniu DOM:**
1. Po załadowaniu strony, w skrypcie `app.js` rejestrujemy handlery dla przycisków, które sortują tablicę.
2. Wywołujemy funkcję `updateDevices()`, która wysyła zapytanie GET do API REST, aby uzyskać najnowsze dane.
3. Rejestrujemy cykliczne wykonanie `updateDevices()`, o wartość `interval`, która domyślnie wynosi 5 sekund.

**Po otrzymaniu danych**
1. Wpierw, wywołujemy funkcję `buildTable(data)`, przekazując odczytane dane JSON z serwera.
2. W `buildTable(data)`, rozpoczynamy iterację nad wszystkimi elementami.
a) W pętli, najpierw sprawdzamy, czy dane ID ma już ustalony znacznik na mapie. Jak nie ma, to tworzymy nowy.
b) Aktualizujemy dane dla znacznika, ustalając jego piktogram oraz kolor "zdrowia", który obliczamy według formuły `var health = battery * (strength + 1);`. Formuła ta ma sens, gdyż im mniejsza jest wartość baterii, czy mocy, to urządzenie również ma mniejsze "zdrowie". Do mocy dodajemy jednak 1, gdyż nawet przy zerowej mocy, urządzenie może rozmawiać ze stacją bazową.
c) Po zaaktualizowaniu znacznika, dodajemy element HTML obecnego urządzenia do tablicy.

# Użyto

**Front-end:** 
* Leaflet
* Font Awesome 4
* leaflet-awesome-markers
* OpenStreetMaps
* jQuery
* Bootstrap

**Back-end:**
* Flask
* requests

# Uwagi

Gdyż miałem problemy z CORS, zrobiłem dla projektu mały pomocniczy program w pythonie, który przechwytuje zapytania do `/radios` i przesyła je do serwera, który musieliśmy pobrać.

Aby włączyć tą aplikację:
1. Należy zainstalować z PIP: Flask, requests.
2. W folderze, włączyć oryginalny serwer.
3. W drugim terminalu, w folderze, gdzie znajduje się `app.py`, należy wpisać `flask run`.