
import requests

try:
    response = requests.get("https://api.alquran.cloud/v1/edition?format=audio&language=ar&type=versebyverse")
    data = response.json()
    
    if data['code'] == 200:
        for edition in data['data']:
            if 'abdul' in edition['identifier'] or 'basit' in edition['englishName'].lower():
                print(f"ID: {edition['identifier']}, Name: {edition['englishName']}, Bitrate: {edition.get('bitrate', 'N/A')}")
    else:
        print("Failed to fetch editions")
except Exception as e:
    print(f"Error: {e}")
