
import requests

bitrates = [32, 40, 48, 64, 80, 96, 112, 128, 160, 192, 320]
base_url = "https://cdn.islamic.network/quran/audio/{}/ar.abdulbasitmurattal/1.mp3"

for bitrate in bitrates:
    url = base_url.format(bitrate)
    try:
        response = requests.head(url, timeout=3)
        if response.status_code == 200:
            print(f"SUCCESS: {bitrate}kbps exists! URL: {url}")
            print(f"Content-Type: {response.headers.get('Content-Type')}")
            break # Found one!
        else:
            print(f"Failed: {bitrate}kbps (Status: {response.status_code})")
    except Exception as e:
        print(f"Error checking {bitrate}kbps: {e}")
