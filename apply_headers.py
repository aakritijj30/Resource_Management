import os
import re

directories = [
    'frontend/src/pages',
]

def apply():
    for d in directories:
        for root, dirs, files in os.walk(d):
            for file in files:
                if file.endswith('.jsx'):
                    path = os.path.join(root, file)
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Strategy 1: Replace <section className="space-y-3"> enclosing page-kicker
                    if 'page-kicker' in content or 'page-title' in content:
                        new_content = re.sub(
                            r'<section className="space-y-3">', 
                            r'<section className="page-header-card space-y-4">', 
                            content
                        )
                        if new_content != content:
                            with open(path, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            print(f'Updated {path}')
