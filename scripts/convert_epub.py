#!/usr/bin/env python3
"""
EPUB to TXT and Chapter Manifest Converter
Processes an EPUB novel deterministically, extracting chapters in spine reading order
and outputting:
  1. A single canonical UTF-8 text file (default: public/novel.txt)
  2. A lightweight companion chapter manifest (default: public/chapters.json)
"""

import os
import sys

# Ensure UTF-8 output encoding on Windows console
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import argparse
import json
import re
import html
from pathlib import Path
import warnings

# Suppress ebooklib future warnings if any
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=FutureWarning)

try:
    import ebooklib
    from ebooklib import epub
    from bs4 import BeautifulSoup
except ImportError as e:
    sys.stderr.write(f"Error: Missing required Python dependency: {e}\n")
    sys.stderr.write("Please install dependencies: pip install ebooklib beautifulsoup4 lxml\n")
    sys.exit(1)


CHAPTER_DELIMITER_LINE = "=" * 80


def find_epub_file(epub_dir: Path, requested_file: str = None) -> Path:
    """
    Find the target EPUB file deterministically.
    If requested_file is provided, use that.
    Otherwise, if exactly one .epub file exists in epub_dir, use it.
    If multiple exist, exit with a helpful error.
    """
    if requested_file:
        p = Path(requested_file)
        if not p.is_file():
            # Check relative to epub_dir
            p2 = epub_dir / requested_file
            if p2.is_file():
                return p2
            raise FileNotFoundError(f"Specified EPUB file not found: {requested_file}")
        return p

    if not epub_dir.exists():
        raise FileNotFoundError(f"EPUB directory does not exist: {epub_dir}")

    epub_files = sorted(list(epub_dir.glob("*.epub")))
    if not epub_files:
        raise FileNotFoundError(f"No .epub files found in directory: {epub_dir}")

    if len(epub_files) > 1:
        names = "\n  - ".join([f.name for f in epub_files])
        raise ValueError(
            f"Multiple EPUB files found in {epub_dir}:\n  - {names}\n"
            "Please specify the desired file using --input or configure the filename."
        )

    return epub_files[0]


def extract_toc_map(book) -> dict:
    """
    Extract mapping from href/filename to title from the EPUB TOC if available.
    """
    toc_map = {}

    def parse_toc_item(item):
        if isinstance(item, tuple) or isinstance(item, list):
            for sub in item:
                parse_toc_item(sub)
        elif hasattr(item, 'href') and hasattr(item, 'title'):
            href = item.href.split('#')[0]
            if item.title and href:
                toc_map[href] = item.title.strip()
        elif isinstance(item, epub.Link):
            href = item.href.split('#')[0]
            if item.title and href:
                toc_map[href] = item.title.strip()
        elif isinstance(item, epub.Section):
            if hasattr(item, 'title') and hasattr(item, 'href'):
                href = item.href.split('#')[0]
                if item.title and href:
                    toc_map[href] = item.title.strip()

    for entry in getattr(book, 'toc', []):
        parse_toc_item(entry)

    return toc_map


def clean_html_to_text(html_content: bytes) -> tuple:
    """
    Extract title and clean paragraphs from HTML bytes.
    Returns: (detected_title, [paragraphs])
    """
    soup = BeautifulSoup(html_content, 'html.parser')

    # Remove non-content elements
    for el in soup(['script', 'style', 'head', 'meta', 'link']):
        el.decompose()

    # Attempt to extract title
    detected_title = None
    title_el = soup.find(['h1', 'h2', 'h3'])
    if title_el:
        candidate = title_el.get_text().strip()
        if candidate:
            detected_title = " ".join(candidate.split())

    # Collect block-level paragraphs
    paragraphs = []
    # If standard <p> tags exist, use them
    p_tags = soup.find_all('p')
    if p_tags:
        for p in p_tags:
            # Replace internal <br> with spaces or line breaks
            for br in p.find_all('br'):
                br.replace_with(' ')
            text = p.get_text()
            # Normalize whitespace within paragraph
            cleaned = re.sub(r'[ \t\r\f\v]+', ' ', text).strip()
            if cleaned:
                paragraphs.append(cleaned)
    else:
        # Fallback to div or body lines
        body = soup.find('body') or soup
        text = body.get_text(separator='\n')
        lines = [re.sub(r'[ \t\r\f\v]+', ' ', line).strip() for line in text.split('\n')]
        paragraphs = [l for l in lines if l]

    return detected_title, paragraphs


def convert_epub(
    epub_path: Path,
    output_txt_path: Path,
    manifest_path: Path,
    min_word_count: int = 100
) -> dict:
    """
    Convert EPUB to UTF-8 TXT and chapter manifest without loading the whole book into memory.
    Filters out book indexes/TOCs, covers, volume stubs, and footnotes so the reader starts directly
    at Chapter 1.
    Writes to temporary files first, then renames atomically.
    """
    print(f"Opening EPUB: {epub_path.name} ({epub_path.stat().st_size / (1024*1024):.2f} MB)")

    book = epub.read_epub(str(epub_path), options={"ignore_ncx": False})
    toc_map = extract_toc_map(book)

    # Ensure parent output directories exist
    output_txt_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)

    tmp_txt_path = output_txt_path.with_suffix(output_txt_path.suffix + ".tmp")
    tmp_manifest_path = manifest_path.with_suffix(manifest_path.suffix + ".tmp")

    chapters_manifest = []
    current_byte_offset = 0
    chapter_num = 0
    total_words = 0

    spine_ids = [item[0] for item in book.spine if isinstance(item, tuple) and item[0]]

    # Patterns identifying non-chapter items (covers, index/TOC, navigation, footnotes)
    excluded_filename_patterns = ['cover', 'nav', 'intro', 'footnote', 'toc']

    print(f"EPUB spine contains {len(spine_ids)} items. Beginning chapter extraction...")

    try:
        with open(tmp_txt_path, 'wb') as txt_out:
            for idx, item_id in enumerate(spine_ids):
                item = book.get_item_with_id(item_id)
                if not item or item.get_type() != ebooklib.ITEM_DOCUMENT:
                    continue

                item_href = (getattr(item, 'file_name', '') or '').lower()
                # Skip non-chapter files (cover, index, toc, nav, footnotes)
                if any(pat in item_href for pat in excluded_filename_patterns):
                    continue

                content = item.get_content()
                if not content or len(content.strip()) == 0:
                    continue

                detected_title, paragraphs = clean_html_to_text(content)
                if not paragraphs:
                    continue

                # Combine text and compute word count
                body_text = "\n\n".join(paragraphs)
                words = len(body_text.split())

                # Skip volume separators, empty stubs, or tiny metadata items (< 100 words)
                if words < min_word_count:
                    continue

                # Determine best chapter title
                raw_href = getattr(item, 'file_name', '')
                title = (
                    toc_map.get(raw_href)
                    or detected_title
                    or f"Chapter {chapter_num + 1}"
                )
                title = html.unescape(title).strip()
                title = " ".join(title.split())

                # Skip any leftover index or book-level header page
                if title.lower() in ["reverend insanity", "table of contents", "contents", "index"]:
                    continue

                chapter_num += 1

                # Format chapter header
                header = f"{CHAPTER_DELIMITER_LINE}\nCHAPTER {chapter_num}: {title}\n{CHAPTER_DELIMITER_LINE}\n\n"
                chapter_content = f"{header}{body_text}\n\n\n"
                chapter_bytes = chapter_content.encode('utf-8')

                start_byte = current_byte_offset
                txt_out.write(chapter_bytes)
                end_byte = start_byte + len(chapter_bytes)
                current_byte_offset = end_byte

                total_words += words

                chapters_manifest.append({
                    "id": chapter_num,
                    "number": chapter_num,
                    "title": title,
                    "startByte": start_byte,
                    "endByte": end_byte,
                    "length": len(chapter_bytes),
                    "wordCount": words
                })

                if chapter_num % 100 == 0:
                    print(f"Processed {chapter_num} chapters ({current_byte_offset / (1024*1024):.2f} MB written)...")

        # Write manifest
        with open(tmp_manifest_path, 'w', encoding='utf-8') as manifest_out:
            json.dump({
                "novelTitle": "Reverend Insanity",
                "author": "Gu Zhenren",
                "totalChapters": len(chapters_manifest),
                "totalWords": total_words,
                "totalBytes": current_byte_offset,
                "generatedAt": "2026-10-18T12:00:00Z",
                "chapters": chapters_manifest
            }, manifest_out, indent=2, ensure_ascii=False)

        # Atomic replace with retry for Windows / OneDrive
        def safe_replace(src: Path, dst: Path, retries: int = 5, delay: float = 0.5):
            import time
            for attempt in range(retries):
                try:
                    if dst.exists():
                        try:
                            dst.unlink()
                        except OSError:
                            pass
                    os.replace(src, dst)
                    return
                except OSError as e:
                    if attempt < retries - 1:
                        time.sleep(delay)
                    else:
                        raise e

        safe_replace(tmp_txt_path, output_txt_path)
        safe_replace(tmp_manifest_path, manifest_path)

        print("\n================ CONVERSION SUMMARY ================")
        print(f"Total chapters extracted: {len(chapters_manifest)}")
        print(f"Total word count:         {total_words:,}")
        print(f"Output TXT size:          {output_txt_path.stat().st_size / (1024*1024):.2f} MB")
        print(f"Output TXT path:          {output_txt_path}")
        print(f"Manifest size:            {manifest_path.stat().st_size / 1024:.2f} KB")
        print(f"Manifest path:            {manifest_path}")
        print("Conversion completed successfully.")
        print("====================================================\n")

        return {
            "totalChapters": len(chapters_manifest),
            "totalWords": total_words,
            "txtSize": output_txt_path.stat().st_size
        }

    except Exception as e:
        # Cleanup temporary files on failure
        if tmp_txt_path.exists():
            tmp_txt_path.unlink()
        if tmp_manifest_path.exists():
            tmp_manifest_path.unlink()
        raise e


def main():
    parser = argparse.ArgumentParser(
        description="Convert Reverend Insanity EPUB to UTF-8 TXT and JSON chapter manifest."
    )
    parser.add_argument(
        "--epub-dir",
        type=Path,
        default=Path("assets/epub"),
        help="Directory containing the input EPUB file (default: assets/epub)"
    )
    parser.add_argument(
        "--input",
        type=str,
        default=None,
        help="Optional specific EPUB filename"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("public/novel.txt"),
        help="Output TXT path (default: public/novel.txt)"
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path("public/chapters.json"),
        help="Output manifest JSON path (default: public/chapters.json)"
    )

    args = parser.parse_args()

    try:
        epub_file = find_epub_file(args.epub_dir, args.input)
        convert_epub(epub_file, args.output, args.manifest)
    except Exception as err:
        sys.stderr.write(f"\n[Conversion Error] {err}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
