# RenoveSouk
RenoveSouk
Guide d'Installation RenovSouk
Installation en Développement
1. Prérequis
Python 3.11 ou supérieur
pip3
Navigateur web moderne
2. Installation des Dépendances Backend
cd backend

pip3 install flask flask-sqlalchemy flask-cors flask-migrate werkzeug
3. Démarrage du Backend
cd backend/src

python3.11 run_server.py

Le serveur backend sera accessible sur http://localhost:5001
4. Démarrage du Frontend
cd frontend

python3.11 -m http.server 8080

Le site sera accessible sur http://localhost:8080
5. Accès aux Interfaces
Site client : http://localhost:8080
Administration : http://localhost:8080/admin/
Installation en Production
1. Prérequis Serveur
Ubuntu 20.04+ ou CentOS 8+
Python 3.11+
PostgreSQL 13+
Nginx
Certificat SSL
2. Configuration Base de Données
-- Créer la base de données

CREATE DATABASE renovsouk;

CREATE USER renovsouk_user WITH PASSWORD 'mot_de_passe_securise';

GRANT ALL PRIVILEGES ON DATABASE renovsouk TO renovsouk_user;
3. Configuration Backend Production
Modifier backend/src/main.py :

# Configuration production

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://renovsouk_user:mot_de_passe@localhost/renovsouk'

app.config['DEBUG'] = False

app.config['SECRET_KEY'] = 'cle_secrete_production'
4. Installation avec Gunicorn
pip3 install gunicorn

cd backend/src

gunicorn -w 4 -b 0.0.0.0:5001 main:app
5. Configuration Nginx
server {

    listen 80;

    server_name votre-domaine.com;

    

    # Redirection HTTPS

    return 301 https://$server_name$request_uri;

}

server {

    listen 443 ssl;

    server_name votre-domaine.com;

    

    ssl_certificate /path/to/certificate.crt;

    ssl_certificate_key /path/to/private.key;

    

    # Frontend

    location / {

        root /path/to/renovsouk-final/frontend;

        index index.html;

        try_files $uri $uri/ =404;

    }

    

    # API Backend

    location /api/ {

        proxy_pass http://localhost:5001;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

    }

    

    # Assets statiques

    location /static/ {

        alias /path/to/renovsouk-final/backend/static/;

        expires 30d;

        add_header Cache-Control "public, immutable";

    }

}
6. Service Systemd
Créer /etc/systemd/system/renovsouk.service :

[Unit]

Description=RenovSouk Backend

After=network.target

[Service]

User=www-data

Group=www-data

WorkingDirectory=/path/to/renovsouk-final/backend/src

Environment=PATH=/usr/bin/python3.11

ExecStart=/usr/local/bin/gunicorn -w 4 -b 127.0.0.1:5001 main:app

Restart=always

[Install]

WantedBy=multi-user.target

Activer le service :

sudo systemctl enable renovsouk

sudo systemctl start renovsouk
Configuration des URLs API
Développement
Les fichiers JavaScript utilisent http://localhost:5001 par défaut.
Production
Modifier dans tous les fichiers JS :

// Remplacer

this.apiBaseUrl = 'http://localhost:5001';

// Par

this.apiBaseUrl = 'https://votre-domaine.com';

Fichiers à modifier :

frontend/js/boutique.js
frontend/js/produit.js
frontend/js/panier.js
frontend/js/checkout.js
frontend/js/confirmation.js
frontend/admin/js/admin.js
Sauvegarde et Maintenance
Sauvegarde Base de Données
# PostgreSQL

pg_dump renovsouk > backup_$(date +%Y%m%d).sql

# SQLite (développement)

cp backend/database/renovsouk.db backup_$(date +%Y%m%d).db
Logs
# Logs application

tail -f /var/log/renovsouk/app.log

# Logs Nginx

tail -f /var/log/nginx/access.log

tail -f /var/log/nginx/error.log
Monitoring
Surveiller l'espace disque
Monitorer les performances de la base de données
Vérifier les certificats SSL
Contrôler les logs d'erreurs
Dépannage
Problèmes Courants
Backend ne démarre pas
# Vérifier les dépendances

pip3 list | grep -E "(flask|sqlalchemy)"

# Vérifier les ports

netstat -tlnp | grep 5001

# Logs détaillés

python3.11 run_server.py --debug
Frontend ne charge pas les données
Vérifier que le backend fonctionne : curl http://localhost:5001/api/products
Vérifier les URLs dans les fichiers JS
Contrôler la console navigateur (F12)
Erreurs CORS
Vérifier la configuration CORS dans main.py :

CORS(app, origins=["http://localhost:8080", "https://votre-domaine.com"])
Base de données corrompue
# Supprimer et recréer (développement)

rm backend/database/renovsouk.db

python3.11 run_server.py  # Recrée automatiquement
Support
Pour toute assistance technique :

Consulter les logs d'erreur
Vérifier la configuration réseau
Tester les endpoints API individuellement
Contacter l'équipe de développement

