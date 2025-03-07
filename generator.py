import os
import pprint
from datetime import datetime
from pathlib import Path

import jinja2
import yaml


class LandingPageGenerator:
    def __init__(self, config_path="config.yaml"):
        """Initialize the landing page generator with configuration."""
        self.config_path = config_path
        self.template_dir = "templates"
        self.output_dir = "docs"
        self.pages_dir = "pages"
        
        # Ensure required directories exist
        for dir_path in [self.template_dir, self.output_dir, self.pages_dir]:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
            
        # Set up Jinja2 environment
        self.env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(self.template_dir),
            autoescape=jinja2.select_autoescape(['html', 'xml'])
        )
        
    def load_config(self):
        """Load configuration from YAML file."""
        try:
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            return {
                'site_name': 'Affiliate Landing Pages',
                'base_url': 'http://localhost',
                'tracking': {'enabled': False}
            }
    
    def load_page_data(self, page_file):
        """Load individual page data from YAML file."""
        with open(os.path.join(self.pages_dir, page_file), 'r') as f:
            return yaml.safe_load(f)
    
    def generate_page(self, page_data, template_name='landing.html'):
        """Generate a single landing page from template and data."""
        template = self.env.get_template(template_name)
        
        # Add common variables
        page_data['generated_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        page_data['site_config'] = self.load_config()
        
        # Render the template
        return template.render(**page_data)
    
    def build_all_pages(self):
        """Build all landing pages found in the pages directory."""
        results = []
        
        for page_file in os.listdir(self.pages_dir):
            pprint.pprint(page_file)
            if not page_file.endswith('.yaml'):
                continue
                
            try:
                # Load page data
                page_data = self.load_page_data(page_file)
                # Generate output filename
                output_file = os.path.join(
                    self.output_dir,
                    page_file.replace('.yaml', '.html')
                )
                template_file = os.path.join(
                    self.template_dir,
                    page_file.replace('.yaml', '.html'))
 
                # Generate and save the page
                pprint.pprint(template_file)
                html_content = self.generate_page(page_data, template_file)
                with open(output_file, 'w') as f:
                    f.write(html_content)
                
                results.append({
                    'page': page_file,
                    'status': 'success',
                    'output': output_file
                })
                
            except Exception as e:
                results.append({
                    'page': page_file,
                    'status': 'error',
                    'error': str(e)
                })
        
        return results

# Example usage
if __name__ == "__main__":
    generator = LandingPageGenerator()
    results = generator.build_all_pages()
    
    print("\nBuild Results:")
    for result in results:
        status = "✓" if result['status'] == 'success' else "✗"
        print(f"{status} {result['page']}")
        if result['status'] == 'error':
            print(f"   Error: {result['error']}")
