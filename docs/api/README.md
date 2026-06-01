# FlatFlow API Docs

FlatFlow exposes generated API documentation from the Django backend using
`drf-spectacular`.

When the backend is running locally, open:

- Swagger UI: /api/docs/
- ReDoc: /api/redoc/
- OpenAPI schema: /api/schema/

The Swagger and ReDoc pages both use the same OpenAPI schema endpoint. Swagger is
useful for trying requests interactively, while ReDoc is better for reading the
API reference.

If `/api/docs/` or `/api/redoc/` returns `Not Found`, rebuild and restart the
backend container so Docker picks up the latest URL configuration:

```powershell
cd src
docker compose up -d --build backend
```

## Generate The API Schema

The live schema is available at `/api/schema/`, but you can
also generate a static OpenAPI file from Django.

```bash
cd src/backend
python manage.py spectacular --file ../../docs/api/openapi-schema.yaml
```

Regenerate the schema whenever API routes, serializers, request bodies, response
shapes, or authentication behavior changes.
