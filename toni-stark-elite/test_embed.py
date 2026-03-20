import urllib.request
import re
import ssl
import json

context = ssl._create_unverified_context()
req = urllib.request.Request("https://www.youtube.com/results?search_query=football+tactical+camera+full+match", headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req, context=context).read().decode('utf-8')
    video_ids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
    seen = set()
    videos = [v for v in video_ids if not (v in seen or seen.add(v))]
    
    valid_videos = []
    for vid in videos:
        # Check oembed
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        try:
            oembed = urllib.request.urlopen(url, context=context).read().decode('utf-8')
            data = json.loads(oembed)
            valid_videos.append((vid, data.get('title', 'Unknown')))
            if len(valid_videos) == 4:
                break
        except Exception as e:
            pass # Embedding blocked or video unavailable
            
    for vid, title in valid_videos:
        print(f"{vid} - {title}")
except Exception as e:
    print("Error:", e)
