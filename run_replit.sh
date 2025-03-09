#!/bin/bash

# Uruchom serwer Django
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

# Przejdź do katalogu frontend i uruchom Vue
cd frontend && npm run serve &
VUE_PID=$!

# Obsługa zakończenia skryptu
trap "kill $DJANGO_PID $VUE_PID; exit" INT TERM
wait