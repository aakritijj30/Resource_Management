import os
import re

files_to_fix = [
    'frontend/src/pages/admin/PolicyConfigPage.jsx',
    'frontend/src/pages/admin/MaintenanceBlockPage.jsx',
    'frontend/src/pages/admin/AllBookingsPage.jsx',
    'frontend/src/pages/admin/ReportsDashboardPage.jsx',
    'frontend/src/pages/profile/ProfilePage.jsx',
]

def process_file(filepath):
    if not os.path.exists(filepath):
        print(f'{filepath} not found')
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove imports
    content = re.sub(r'import Sidebar from [^\n]*\n', '', content)
    content = re.sub(r'import Navbar from [^\n]*\n', '', content)
    
    # Refactor the wrapper
    pattern = r'<div className=\"flex min-h-screen\">\s*<Sidebar />\s*<div className=\"flex-1[^>]*\">\s*<Navbar[^>]*/>\s*<main[^>]*>'
    replacement = r'<div className="w-full flex-col flex animate-fade-in relative z-10 pb-12">'
    
    if re.search(pattern, content):
        content = re.sub(pattern, replacement, content, count=1)
        # remove closing tags
        content = content.replace('</main>\n      </div>\n    </div>', '</div>')
        content = content.replace('</main>\r\n      </div>\r\n    </div>', '</div>')
    
    # Fix dark mode colors
    content = content.replace('text-white/40', 'text-surface-500 font-medium pb-2')
    content = content.replace('text-white/60', 'text-surface-600')
    content = content.replace('text-white/30', 'text-primary-600 font-bold')
    content = content.replace('text-white', 'text-surface-900')
    content = content.replace('bg-white/5', 'bg-white border placeholder-surface-400 text-surface-900 border-surface-200 shadow-sm')
    content = content.replace('border-white/5', 'border-surface-200')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Processed {filepath}')

for f in files_to_fix:
    process_file(f)
