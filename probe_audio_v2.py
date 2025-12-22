
import requests
import sys

# Test different editions and bitrates
bitrates = [64, 128, 192]
editions = [
    "ar.abdulbasitmurattal",
    "ar.abdulbasit",
    "ar.minshawi",
    "ar.alafasy"
]

print("Starting probe...", flush=True)

for edition in editions:
    print(f"Checking edition: {edition}...", flush=True)
    for bitrate in bitrates:
        url = f"https://cdn.islamic.network/quran/audio/{bitrate}/{edition}/1.mp3"
        try:
            response = requests.head(url, timeout=2)
            if response.status_code == 200:
                print(f"  [SUCCESS] {bitrate}kbps exists for {edition}", flush=True)
            else:
                print(f"  [FAILED] {bitrate}kbps for {edition} (Status: {response.status_code})", flush=True)
        except Exception as e:
            print(f"  [ERROR] {bitrate}kbps for {edition}: {e}", flush=True)

print("Probe complete.", flush=True)
