#!/bin/bash

# Informacje o uruchamianych procesach
echo "======================================="
echo "Uruchamianie aplikacji w środowisku Replit"
echo "======================================="
echo "Backend (Django): http://localhost:8000/api/"
echo "Frontend (Vue): http://localhost:8080/"
echo "======================================="

# Sprawdzanie czy port 8000 jest wolny
if netstat -tuln | grep -q ":8000 "; then
  echo "OSTRZEŻENIE: Port 80 jest już używany. Django może nie uruchomić się poprawnie."
fi

# Uruchom migracje Django (jeśli potrzebne)
echo "Wykonywanie migracji Django..."
python manage.py migrate

# Uruchom serwer Django
echo "Uruchamianie backendu Django na porcie 8000..."
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

# Przejdź do katalogu frontend i uruchom Vue
echo "Uruchamianie frontendu Vue..."
cd frontend && npm run serve &
VUE_PID=$!

echo "Obydwa procesy zostały uruchomione!"
echo "Naciśnij Ctrl+C aby zatrzymać obydwa serwery."

# Obsługa zakończenia skryptu
trap "echo 'Zatrzymywanie serwerów...'; kill $DJANGO_PID $VUE_PID; exit" INT TERM
wait