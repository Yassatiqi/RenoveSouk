#!/usr/bin/env python3.11
import sys
import os

# Ajouter le répertoire courant au path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app

if __name__ == '__main__':
    print("Démarrage du serveur RenovSouk sur le port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)

