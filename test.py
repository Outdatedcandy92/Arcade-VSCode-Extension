import requests

url = "https://hackhour.hackclub.com/status"  # Replace with the URL you want to ping

try:
    response = requests.get(url)
    print(response.text)
except requests.exceptions.RequestException as e:
    print("Error:", e)