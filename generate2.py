import os
import pprint

import yaml
from jinja2 import Environment, FileSystemLoader

# Paths for templates, content, and output
TEMPLATE_DIR = "templates"
CONTENT_DIR = "content"
OUTPUT_DIR = "docs"

# Initialize Jinja2 environment
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

# Load the HTML template (base.html)
template = env.get_template("base.html")

# Ensure the output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)


def load_page_data(page_file):
    """Load individual page data from YAML file."""
    with open(os.path.join(CONTENT_DIR, page_file), 'r') as f:
        return yaml.safe_load(f)

# Iterate through content files and generate HTML
for content_file in os.listdir(CONTENT_DIR):
    if content_file.endswith(".yaml"):  # Process only .txt files
        # Read the content from the file
        pprint.pprint(content_file)
        content = load_page_data(content_file)

        # Generate HTML using the template and content
        html_output = template.render(content)

        # Save the generated HTML to the output directory
        output_file = os.path.join(OUTPUT_DIR, content_file.replace(".yaml", ".html"))
        with open(output_file, "w") as f:
            f.write(html_output)

        print(f"Generated: {output_file}")

