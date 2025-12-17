# Docker - Backend

## Requisitos

- Docker
- Docker Compose (opcional, pero recomendado)

## Uso con Docker Compose (Recomendado)

### Construir y ejecutar:

```bash
cd backend
docker-compose up --build
```

### Ejecutar en segundo plano:

```bash
docker-compose up -d
```

### Ver logs:

```bash
docker-compose logs -f
```

### Detener:

```bash
docker-compose down
```

## Uso con Docker directamente

### Construir la imagen:

```bash
cd backend
docker build -t backend-simulaciones .
```

### Ejecutar el contenedor:

```bash
docker run -d \
  --name backend-simulaciones \
  -p 4000:4000 \
  -v $(pwd)/data:/app/data \
  -e BACKEND_PORT=4000 \
  -e CORS_ORIGIN=http://localhost:3000 \
  backend-simulaciones
```

### Ver logs:

```bash
docker logs -f backend-simulaciones
```

### Detener y eliminar:

```bash
docker stop backend-simulaciones
docker rm backend-simulaciones
```

## Persistencia de datos

Los datos (base de datos SQLite y archivos de simulaciones) se persisten mediante un volumen montado en `./data`. Esto significa que los datos se guardan en tu máquina local y no se pierden al detener o eliminar el contenedor.

## Variables de entorno

Puedes modificar las variables de entorno en `docker-compose.yml` o pasarlas al ejecutar `docker run`:

- `BACKEND_PORT`: Puerto del servidor (default: 4000)
- `CORS_ORIGIN`: Origen permitido para CORS (default: http://localhost:3000)
- `DATABASE_FILE`: Ruta del archivo de base de datos (opcional)

## Notas

- La base de datos se crea automáticamente en `./data/base_datos.sqlite` si no existe
- Los archivos de simulaciones se guardan en `./data/simulaciones/`
- Si cambias el código, necesitas reconstruir la imagen: `docker-compose build`

