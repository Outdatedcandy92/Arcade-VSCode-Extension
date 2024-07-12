import requests
from datetime import timedelta


APIKEY = "somekey"
SLACK = "U079HV9PTC7"

url = f"https://hackhour.hackclub.com/api/session/{SLACK}"
headers = {"Authorization": f"Bearer {APIKEY}"}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    print(data)
    remaining = data.get('remaining', 'Not found')
    print(remaining)
else:
    print("Error:", response.status_code)