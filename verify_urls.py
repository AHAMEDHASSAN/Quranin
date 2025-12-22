
import requests

# Test URLs for Al-Fatiha Ayah 1
url_192 = "https://cdn.islamic.network/quran/audio/192/ar.abdulbasitmurattal/1.mp3"
url_64 = "https://cdn.islamic.network/quran/audio/64/ar.abdulbasitmurattal/1.mp3"

def check_url(url):
    try:
        print(f"Checking {url}...")
        response = requests.head(url)
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
    except Exception as e:
        print(f"Error checking {url}: {e}")

check_url(url_192)
check_url(url_64)
