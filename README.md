## Create the environment file

```bash
$ echo -e "GEMINI_API_KEY=your_api_key\nDB_PATH=database.sqlite" > arquivo.env
```

## Compile and run the project

```bash
$ docker-compose build
$ docker-compose up
```

## Resources

#### POST /upload

Request:
```json
{
  "image": string,
  "customer_code": string,
  "measure_datetime": string,
  "measure_type": string
}
```

Response 200:
```json
{
  "image_url": string,
  "measure_value": integer,
  "measure_uuid": string,
}
```

#### PATCH /confirm

Request:
```json
{
  "measure_uuid": string,
  "confirmed_value": number
}
```

Response 200:
```json
{
  "success": true
}
```

#### GET /<customer_code>/list?measure_type=

Response 200:
```json
{
  "customer_code": string,
  "measures": [
    {
      "measure_uuid": string,
      "measure_datetime": string,
      "measure_type": string,
      "has_confirmed": boolean,
      "image_url": string,
    }
  ]
}
```
