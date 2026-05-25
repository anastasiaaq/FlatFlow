import http.client
import sys


HEALTHCHECK_HOST = "127.0.0.1"
HEALTHCHECK_PORT = 8000
HEALTHCHECK_PATH = "/health/"


def main():
    connection = http.client.HTTPConnection(
        HEALTHCHECK_HOST,
        HEALTHCHECK_PORT,
        timeout=3,
    )
    try:
        connection.request("GET", HEALTHCHECK_PATH)
        response = connection.getresponse()
        return 0 if response.status == 200 else 1
    except (OSError, http.client.HTTPException):
        return 1
    finally:
        connection.close()

if __name__ == "__main__":
    sys.exit(main())
