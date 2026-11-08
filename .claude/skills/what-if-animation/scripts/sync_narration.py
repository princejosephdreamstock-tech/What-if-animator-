import json, pathlib
root = pathlib.Path(__file__).resolve().parent / "src" / "episodes"
for f in root.glob("*/episode.json"):
    j = json.load(open(f, encoding="utf8"))
    text = "\n".join(s["text"].strip() for s in j["script"])
    (f.parent / "narration.txt").write_text(text, encoding="utf8")
