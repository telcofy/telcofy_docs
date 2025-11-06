import os
import argparse
import re
import json
from datetime import datetime, timezone

def clean_content_for_llm(content):
    """
    Cleans MDX/MD content to make it LLM-friendly by removing:
    - Frontmatter (YAML metadata)
    - Import statements
    - JSX components and inline styles
    - HTML-style tags
    Keeps actual documentation content.
    """
    # First pass: remove multiline JSX style blocks using regex on full content
    # Remove style={{...}} blocks that span multiple lines
    content = re.sub(r'style=\{\{[^}]*\}\}', '', content, flags=re.DOTALL)

    # Remove entire JSX/HTML tags with any props (preserving inner content)
    content = re.sub(r'<(div|span|h1|h2|h3|h4|h5|h6|p|a)\s+[^>]*>([^<]*)</\1>', r'\2', content, flags=re.DOTALL)

    # Remove opening and closing HTML/JSX tags
    content = re.sub(r'</?(?:div|span|h1|h2|h3|h4|h5|h6|p)\s*>', '', content)

    # Remove self-closing JSX components
    content = re.sub(r'<[A-Z][a-zA-Z0-9]*[^/>]*\s*\/>', '', content)

    # Remove JSX component open/close tags
    content = re.sub(r'</?[A-Z][a-zA-Z0-9]*[^>]*>', '', content)

    # Now process line by line for frontmatter and imports
    lines = content.split('\n')
    cleaned_lines = []
    in_frontmatter = False
    frontmatter_count = 0

    for line in lines:
        # Handle frontmatter (YAML between --- markers)
        if line.strip() == '---':
            if frontmatter_count == 0:
                in_frontmatter = True
                frontmatter_count += 1
                continue
            elif frontmatter_count == 1:
                in_frontmatter = False
                frontmatter_count += 1
                continue

        if in_frontmatter:
            continue

        # Skip import/export statements
        if line.strip().startswith('import ') or line.strip().startswith('export '):
            continue

        # Skip lines that only contain JSX artifacts like closing braces
        stripped = line.strip()
        if stripped in ['}>', '<div>', '</div>', '<span>', '</span>', '{', '}', '}}']:
            continue

        # Skip lines that are now empty after cleaning
        if line.strip():
            cleaned_lines.append(line)

    return '\n'.join(cleaned_lines)

def create_llm_friendly_docs(docs_dir, output_file):
    """
    Finds all .md and .mdx files in a directory, cleans them for LLM consumption,
    and outputs structured JSON optimized for LLM parsing.
    """
    if not os.path.isdir(docs_dir):
        print(f"Error: Directory not found at {docs_dir}")
        return

    documents = []

    for root, _, files in os.walk(docs_dir):
        # Sort files for consistent output
        for filename in sorted(files):
            if filename.endswith((".md", ".mdx")):
                file_path = os.path.join(root, filename)
                relative_path = os.path.relpath(file_path, docs_dir)

                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        raw_content = infile.read()

                    # Clean the content
                    cleaned_content = clean_content_for_llm(raw_content)

                    # Only include if there's actual content after cleaning
                    if cleaned_content.strip():
                        doc = {
                            "path": relative_path,
                            "content": cleaned_content.strip()
                        }
                        documents.append(doc)

                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")

    # Output structured JSON format
    output_data = {
        "metadata": {
            "generated": datetime.now(timezone.utc).isoformat(),
            "source": "Telcofy Documentation",
            "total_documents": len(documents),
            "description": "LLM-optimized documentation with frontmatter, imports, JSX, and styling removed"
        },
        "documents": documents
    }

    with open(output_file, 'w', encoding='utf-8') as outfile:
        json.dump(output_data, outfile, indent=2, ensure_ascii=False)

    return len(documents)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Create LLM-optimized JSON documentation from a directory of markdown files. "
                    "Strips frontmatter, imports, JSX components, and styling."
    )
    parser.add_argument("docs_dir", help="The directory containing the markdown files.")
    parser.add_argument("output_file", help="The path to the output JSON file.")
    args = parser.parse_args()

    file_count = create_llm_friendly_docs(args.docs_dir, args.output_file)
    print(f"✓ Successfully created {args.output_file}")
    print(f"✓ Processed {file_count} documentation files")
