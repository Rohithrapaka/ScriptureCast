#!/usr/bin/env python3
"""
Download Telugu Bible dataset from Kaggle and store it in the project data folder.
The dataset ID is: shyamtgr/telugu-bible-dataset-json-format
"""
import json
import os
import shutil
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "bible")


def main():
    # Check if data already exists
    if os.path.exists(DATA_DIR) and os.listdir(DATA_DIR):
        files = os.listdir(DATA_DIR)
        print(f"Bible data already exists at {DATA_DIR} ({len(files)} files)")
        return

    os.makedirs(DATA_DIR, exist_ok=True)

    try:
        import kagglehub
    except ImportError:
        print("ERROR: kagglehub is not installed. Run: pip install kagglehub", file=sys.stderr)
        sys.exit(1)

    print("Downloading Telugu Bible dataset from Kaggle...")
    try:
        path = kagglehub.dataset_download("shyamtgr/telugu-bible-dataset-json-format")
        print(f"Downloaded to: {path}")
    except Exception as e:
        print(f"ERROR downloading dataset: {e}", file=sys.stderr)
        sys.exit(1)

    # Inspect and copy files
    print(f"Inspecting dataset structure at: {path}")
    _walk_and_copy(path, DATA_DIR)

    print(f"Bible data stored at: {DATA_DIR}")
    _inspect(DATA_DIR)


def _walk_and_copy(src: str, dst: str):
    """Recursively copy all files from src to dst, preserving structure."""
    for root, dirs, files in os.walk(src):
        rel = os.path.relpath(root, src)
        target = os.path.join(dst, rel) if rel != "." else dst
        os.makedirs(target, exist_ok=True)
        for f in files:
            src_file = os.path.join(root, f)
            dst_file = os.path.join(target, f)
            shutil.copy2(src_file, dst_file)
            print(f"  Copied: {os.path.relpath(dst_file, dst)}")


def _inspect(data_dir: str):
    """Print a summary of what we downloaded."""
    print("\n=== Dataset Structure ===")
    for root, dirs, files in os.walk(data_dir):
        rel = os.path.relpath(root, data_dir)
        indent = "  " * (rel.count(os.sep) + (0 if rel == "." else 1))
        if rel != ".":
            print(f"{indent}{os.path.basename(root)}/")
        for f in files:
            fpath = os.path.join(root, f)
            size = os.path.getsize(fpath)
            print(f"{indent}  {f} ({size:,} bytes)")

    # Peek at first JSON file to show structure
    for root, dirs, files in os.walk(data_dir):
        for f in sorted(files):
            if f.endswith(".json"):
                fpath = os.path.join(root, f)
                try:
                    with open(fpath, "r", encoding="utf-8") as fp:
                        data = json.load(fp)
                    print(f"\n=== Sample structure from {f} ===")
                    if isinstance(data, list):
                        print(f"  Type: array, length: {len(data)}")
                        if data:
                            print(f"  First item keys: {list(data[0].keys()) if isinstance(data[0], dict) else type(data[0]).__name__}")
                            if isinstance(data[0], dict):
                                print(f"  First item sample: {json.dumps(data[0], ensure_ascii=False)[:300]}")
                    elif isinstance(data, dict):
                        print(f"  Type: object, keys: {list(data.keys())[:10]}")
                        for k, v in list(data.items())[:3]:
                            print(f"    {k}: {str(v)[:100]}")
                    return  # Only peek at first file
                except Exception as e:
                    print(f"  Could not parse {f}: {e}")


if __name__ == "__main__":
    main()
