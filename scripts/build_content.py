"""Build editable CMS content into static pages. No external dependencies."""
from pathlib import Path
from html import escape
import json,re

def build(root):
    root=Path(root)
    gallery=json.loads((root/'content/gallery.json').read_text(encoding='utf-8'))['photos']
    events=json.loads((root/'content/trainings.json').read_text(encoding='utf-8'))['events']
    def ordered(items):
        ids=[x['id'] for x in items]
        if len(ids)!=len(set(ids)):raise ValueError('Kayıt kodları benzersiz olmalı')
        return sorted((x for x in items if x.get('published') is True),key=lambda x:float(x.get('order') or 0))
    def image_path(value):
        value=str(value).lstrip('/')
        if not value.startswith('assets/') or '..' in Path(value).parts:raise ValueError('Görsel yolu assets/ içinde olmalı')
        if not (root/value).is_file():raise ValueError('Görsel bulunamadı: '+value)
        return '../'+value
    photos=[]
    for x in ordered(gallery):
        if x['category'] not in ['uygulama','egitim','bulusma']:raise ValueError('Geçersiz kategori')
        if not x['title'].strip() or not x['alt'].strip():raise ValueError('Başlık ve görsel açıklaması gerekli')
        photos.append(dict(no=x['id'],title=x['title'],alt=x['alt'],category=x['category'],src=image_path(x['image']),thumb=image_path(x.get('thumbnail') or x['image'])))
    cards=''.join(f'<button class="g-card" data-index="{i}" data-category="{x["category"]}" aria-label="{escape(x["title"],quote=True)}, fotoğraf {escape(x["no"],quote=True)}"><img src="{escape(x["thumb"],quote=True)}" alt="{escape(x["alt"],quote=True)}" loading="lazy" width="640" height="640"><span>{escape(x["title"])}<b>↗</b></span></button>' for i,x in enumerate(photos))
    pg=root/'galeri/index.html';s=pg.read_text(encoding='utf-8')
    s=re.sub(r'<div class="g-grid">.*?</div>',lambda m:'<div class="g-grid">'+cards+'</div>',s,flags=re.S)
    encoded=json.dumps(photos,ensure_ascii=False).replace('<','\\u003c')
    s=re.sub(r'(<script type="application/json" id="gallery-data">).*?(</script>)',lambda m:m[1]+encoded+m[2],s,flags=re.S)
    s=re.sub(r'(<p id="g-status" role="status">).*?(</p>)',lambda m:m[1]+str(len(photos))+' fotoğraf'+m[2],s)
    pg.write_text(s,encoding='utf-8')
    published=ordered(events)
    for x in published:
        for key in ['title','date','location','description']:
            if not str(x.get(key,'')).strip():raise ValueError('Eğitim alanı eksik: '+key)
    start='<!-- CMS-TRAININGS-START -->';end='<!-- CMS-TRAININGS-END -->'
    for path in ['index.html','egitim/index.html']:
        file=root/path;s=file.read_text(encoding='utf-8');contact='#contact' if path=='index.html' else '../#contact'
        entries=''.join('<article class="announcement"><p class="eyebrow">'+escape(x['date'])+' · '+escape(x['location'])+'</p><h3>'+escape(x['title'])+'</h3><p>'+escape(x['description']).replace('\n','<br>')+'</p><a class="button outline" href="'+contact+'">EĞİTİM BİLGİSİ AL ↗</a></article>' for x in published)
        block=('<section class="training-announcements" aria-label="Eğitim duyuruları"><p class="eyebrow">GÜNCEL PROGRAM</p><h2>Eğitim duyuruları.</h2><div>'+entries+'</div></section>') if entries else ''
        replace=start+block+end
        if start in s:s=re.sub(re.escape(start)+'.*?'+re.escape(end),lambda m:replace,s,flags=re.S)
        elif path=='index.html':s=s.replace('<section class="academy-section"',replace+'<section class="academy-section"')
        else:s=s.replace('</main>',replace+'</main>')
        css='gallery-home.css?v=2' if path=='index.html' else '../gallery-home.css?v=2'
        if path=='egitim/index.html' and 'gallery-home.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="'+css+'"></head>')
        if path=='index.html':
            s=s.replace('gallery-home.css?v=1','gallery-home.css?v=2')
            s=re.sub(r'\d+ FOTOĞRAFI KEŞFET',str(len(photos))+' FOTOĞRAFI KEŞFET',s)
        file.write_text(s,encoding='utf-8')
    print(json.dumps({'gallery':len(photos),'published_trainings':len(published)}))

if __name__=='__main__':build(Path(__file__).resolve().parents[1])
