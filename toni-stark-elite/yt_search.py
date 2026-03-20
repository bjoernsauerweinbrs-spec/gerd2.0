import urllib.request
import re

query = "football tactical match analysis"
url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    video_ids = re.findall(r'"videoId":"(.{11})"', html)
    seen = set()
    unique_ids = [x for x in video_ids if not (x in seen or seen.add(x))]
    for vid in unique_ids[:5]:
        print(vid)
except Exception as e:
    print("Error:", e)
