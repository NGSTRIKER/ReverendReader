import json
from pathlib import Path

def test_chapter_offsets():
    manifest_path = Path("public/chapters.json")
    novel_path = Path("public/novel.txt")

    assert manifest_path.exists(), "Manifest does not exist"
    assert novel_path.exists(), "Novel TXT does not exist"

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    chapters = manifest["chapters"]
    total = len(chapters)
    print(f"Total chapters in manifest: {total}")

    novel_size = novel_path.stat().st_size
    assert novel_size == manifest["totalBytes"], f"Novel size {novel_size} != manifest {manifest['totalBytes']}"

    # Test chapter 1, middle chapter, and final chapter
    test_indices = [0, total // 2, total - 1]

    with open(novel_path, "rb") as f:
        for idx in test_indices:
            c = chapters[idx]
            f.seek(c["startByte"])
            length = c["endByte"] - c["startByte"]
            data = f.read(length)

            assert len(data) == length, f"Expected {length} bytes, got {len(data)}"
            assert len(data) == c["length"], f"Manifest length mismatch for chapter {c['id']}"

            # Check UTF-8 validity
            text = data.decode("utf-8")
            lines = [line.strip() for line in text.split("\n") if line.strip()]

            # First non-empty line should be delimiter
            assert lines[0].startswith("==="), f"Chapter {c['id']} does not start with delimiter"
            # Second line should contain CHAPTER {number}
            assert f"CHAPTER {c['number']}:" in lines[1], f"Chapter header mismatch: {lines[1]}"

            print(f"Chapter {c['id']} validated successfully: {c['title']} ({len(lines)} lines, {len(data)} bytes)")

    # Validate that byte offsets are contiguous without gaps or overlaps
    for i in range(len(chapters) - 1):
        assert chapters[i]["endByte"] == chapters[i + 1]["startByte"], (
            f"Gap or overlap between chapter {chapters[i]['id']} and {chapters[i+1]['id']}"
        )

    print("All chapters are contiguous with 0 gaps and 0 overlaps!")
    print("Offset test passed successfully.")

if __name__ == "__main__":
    test_chapter_offsets()
