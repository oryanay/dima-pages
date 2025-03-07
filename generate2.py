import os
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

# Iterate through content files and generate HTML
for content_file in os.listdir(CONTENT_DIR):
    if content_file.endswith(".txt"):  # Process only .txt files
        # Read the content from the file
        with open(os.path.join(CONTENT_DIR, content_file), "r") as f:
            content = f.read()

        # Generate HTML using the template and content
        html_output = template.render(title=content_file.replace(".txt", ""), body=content)

        # Save the generated HTML to the output directory
        output_file = os.path.join(OUTPUT_DIR, content_file.replace(".txt", ".html"))
        with open(output_file, "w") as f:
            f.write(html_output)

        print(f"Generated: {output_file}")

