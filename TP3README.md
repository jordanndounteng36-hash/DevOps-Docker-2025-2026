
---

# SujetTP3/README.md

```md
# TP3 - TaskFlow

## Objectif

Conteneuriser une application de gestion de tâches à l'aide de Docker Compose.

## Architecture

### Frontend
- Nginx
- Port 8080

### Backend
- Node.js
- Port 3001

### Cache
- Redis
- Accessible uniquement depuis le réseau Docker

## Lancement

```bash
docker compose up --build
