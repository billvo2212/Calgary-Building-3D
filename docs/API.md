# Urban Dashboard API Reference

## Base URL
https://<your-host>[:PORT]/api


> By default in development: `http://localhost:5001/api`

---

## Authentication

_None required._ All endpoints are public.

---

## Endpoints

| Method | Path               | Description                                 | Query / Body                                                                 | Success Response                                                                                                         | Error Cases                                                 |
| ------ | ------------------ | ------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| GET    | `/buildings`       | Fetch raw building data from Calgary Open Data | —                                                                           | **200 OK**<br>```json { "success": true, "data": [ …building objects… ], "count": N } ```                                   | **500 Internal Server Error** if fetch fails                |
| POST   | `/query`           | Run an LLM-parsed filter against a building list | ```json { "query": "string", "buildings": [ …building objects… ] }```       | **200 OK**<br>```json { "success": true, "filter_params": {…}, "filtered_buildings": […], "total_matches": M }```            | **400 Bad Request** missing/invalid query or parse failure<br>**500 Internal Server Error** on unexpected exceptions |
| GET    | `/projects`        | List all saved projects (latest first)       | —                                                                           | **200 OK**<br>```json { "success": true, "projects": [ { "id": "...", "name": "...", "filters": […], "created_at": "…" }, … ] }``` | **500 Internal Server Error** on DB errors                 |
| POST   | `/projects`        | Save a new project                            | ```json { "name": "My Analysis", "filters": […filter params…] }```           | **200 OK**<br>```json { "success": true, "project": { "id": "...", "name": "...", "filters": […], "created_at": "…" } }```     | **400 Bad Request** if `name` is missing<br>**500 Internal Server Error** on DB errors |
| GET    | `/health`          | Health check                                 | —                                                                           | **200 OK**<br>```json { "status": "healthy", "message": "Urban Dashboard API is running" }```                              | _n/a_                                                      |

---

## Models

### Project

- **id** (_int_, primary key)  
- **name** (_string_) — user-provided project name  
- **filters** (_JSON_) — array of `{ attribute, operator, value }` objects  
- **created_at** (_datetime_) — auto-populated timestamp  

Exposes:
```python
Project.to_dict() → {
    "id": <int>,
    "name": <str>,
    "filters": <list>,
    "created_at": <ISO8601 str>
}
