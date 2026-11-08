#!/usr/bin/env python3
"""
Chinese Raw EPUB to TXT and Chapter Manifest Converter
Extracts all 2,334 chapters from '蛊真人 - 蛊真人.epub' into:
  1. public/novel-zh.txt
  2. public/chapters-zh.json
"""

import os
import sys
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

DELIMITER = "=" * 80

class ParagraphExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_body = False
        self.in_p = False
        self.current_p = []
        self.paragraphs = []

    def handle_starttag(self, tag, attrs):
        if tag == 'body':
            self.in_body = True
        elif self.in_body and tag == 'p':
            self.in_p = True
            self.current_p = []

    def handle_endtag(self, tag):
        if tag == 'body':
            self.in_body = False
        elif tag == 'p' and self.in_p:
            text = ''.join(self.current_p).strip()
            cleaned = re.sub(r'[ \t\r\f\v]+', ' ', text).strip()
            if cleaned:
                self.paragraphs.append(cleaned)
            self.in_p = False
            self.current_p = []

    def handle_data(self, data):
        if self.in_p:
            self.current_p.append(data)


def convert_chinese_epub(epub_path: Path, output_txt: Path, output_json: Path):
    print(f"Opening Chinese EPUB: {epub_path.name} ({epub_path.stat().st_size / (1024*1024):.2f} MB)")
    
    with zipfile.ZipFile(str(epub_path)) as z:
        ncx_content = z.read('OEBPS/toc.ncx')
        root = ET.fromstring(ncx_content)
        navpoints = root.findall('.//{http://www.daisy.org/z3986/2005/ncx/}navPoint')
        
        chapter_items = []
        for np in navpoints:
            text = np.find('.//{http://www.daisy.org/z3986/2005/ncx/}text')
            content = np.find('{http://www.daisy.org/z3986/2005/ncx/}content')
            title = text.text if text is not None else ''
            src = content.get('src') if content is not None else ''
            if '节' in title or '章' in title:
                chapter_items.append((title.strip(), src.strip()))
                
        print(f"Found {len(chapter_items)} chapters in TOC.")
        
        output_txt.parent.mkdir(parents=True, exist_ok=True)
        output_json.parent.mkdir(parents=True, exist_ok=True)
        
        tmp_txt = output_txt.with_suffix(".tmp")
        tmp_json = output_json.with_suffix(".tmp")
        
        chapters_manifest = []
        current_offset = 0
        total_chars = 0
        
        with open(tmp_txt, 'wb') as txt_out:
            for i, (title, src) in enumerate(chapter_items, start=1):
                clean_src = src.split('#')[0]
                zpath = 'OEBPS/' + clean_src
                raw_html = z.read(zpath).decode('utf-8', errors='replace')
                
                parser = ParagraphExtractor()
                parser.feed(raw_html)
                
                body_text = "\n\n".join(parser.paragraphs)
                char_count = len(re.findall(r'[\u4e00-\u9fff\w]', body_text))
                total_chars += char_count
                
                header = f"{DELIMITER}\nCHAPTER {i}: {title}\n{DELIMITER}\n\n"
                chapter_str = f"{header}{body_text}\n\n\n"
                chapter_bytes = chapter_str.encode('utf-8')
                
                start_byte = current_offset
                txt_out.write(chapter_bytes)
                end_byte = start_byte + len(chapter_bytes)
                current_offset = end_byte
                
                chapters_manifest.append({
                    "id": i,
                    "number": i,
                    "title": title,
                    "startByte": start_byte,
                    "endByte": end_byte,
                    "length": len(chapter_bytes),
                    "wordCount": char_count
                })
                
                if i % 200 == 0 or i == len(chapter_items):
                    print(f"Processed {i}/{len(chapter_items)} chapters ({current_offset / (1024*1024):.2f} MB)...")
                    
        manifest_data = {
            "novelTitle": "蛊真人",
            "author": "蛊真人",
            "edition": "raw",
            "language": "zh",
            "totalChapters": len(chapters_manifest),
            "totalWords": total_chars,
            "totalBytes": current_offset,
            "generatedAt": "2026-11-08T12:00:00Z",
            "chapters": chapters_manifest
        }
        
        with open(tmp_json, 'w', encoding='utf-8') as json_out:
            json.dump(manifest_data, json_out, ensure_ascii=False, indent=2)
            
        if output_txt.exists():
            output_txt.unlink()
        if output_json.exists():
            output_json.unlink()
            
        os.replace(tmp_txt, output_txt)
        os.replace(tmp_json, output_json)
        
        print("\n=== CONVERSION COMPLETE ===")
        print(f"Total Chapters: {len(chapters_manifest)}")
        print(f"Total Characters: {total_chars:,}")
        print(f"TXT File Size: {output_txt.stat().st_size / (1024*1024):.2f} MB -> {output_txt}")
        print(f"JSON Manifest Size: {output_json.stat().st_size / 1024:.2f} KB -> {output_json}")


if __name__ == "__main__":
    epub_file = Path("assets/epub/蛊真人 - 蛊真人.epub")
    if not epub_file.exists():
        epub_file = Path("/home/nameless/Downloads/蛊真人 - 蛊真人.epub")
        
    out_txt = Path("public/novel-zh.txt")
    out_json = Path("public/chapters-zh.json")
    
    convert_chinese_epub(epub_file, out_txt, out_json)
