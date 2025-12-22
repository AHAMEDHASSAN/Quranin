
import requests

url = "https://cdn.islamic.network/quran/audio/192/ar.abdulbasitmurattal/4.mp3"
try:
    response = requests.head(url)
    print(f"Status Code: {response.status_code}")
    print(f"Content Type: {response.headers.get('Content-Type')}")
except Exception as e:
    print(f"Error: {e}")
