import urllib.request
import re
import ssl

context = ssl._create_unverified_context()
req = urllib.request.Request("https://www.youtube.com/results?search_query=football+tactical+camera+full+match", headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req, context=context).read().decode('utf-8')
    video_ids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
    seen = set()
    videos = [v for v in video_ids if not (v in seen or seen.add(v))]
    for v in videos[:4]:
        print(v)
except Exception as e:
    print("Error:", e)
