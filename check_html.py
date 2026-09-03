with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('<div class="results-grid">')
end = content.find('<!-- Results Breakdown -->')
print(content[start:start+1500])
