import requests

url = "http://hackhour.hackclub.com/api/history/U079HV9PTC7"  # Replace with the URL you want to ping
api = "f8ab410e-0308-417b-9088-42ca3bdf21af"

headers = {
    "Authorization": f"Bearer {api}"
}

try:
    response = requests.get(url, headers=headers)
    print(response.text)
except requests.exceptions.RequestException as e:
    print("Error:", e)