from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.error import HTTPError
from urllib.parse import urlsplit, urlunsplit, urljoin
from collections import defaultdict
from pathlib import Path
import csv, datetime, json, struct, time, xml.etree.ElementTree as ET

BASE = 'http://localhost:3010'
PUBLIC = 'https://serviciosonlineweb.com'
OUT = Path('.local/public-route-qa.json')
OUT.parent.mkdir(parents=True, exist_ok=True)

def local_path(url):
    value = urlsplit(urljoin(PUBLIC + '/', url))
    if value.hostname not in ('serviciosonlineweb.com', 'localhost'):
        return None
    if value.username or value.password:
        return None
    if value.hostname == 'localhost' and value.port != 3010:
        return None
    return urlunsplit(('', '', value.path or '/', value.query, ''))

class LocalRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        parsed = urlsplit(newurl)
        if parsed.scheme != 'http' or parsed.hostname != 'localhost' or parsed.port != 3010:
            raise ValueError('Blocked redirect outside localhost:3010')
        return super().redirect_request(req, fp, code, msg, headers, newurl)

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.titles, self.h1, self.canonical, self.robots, self.og, self.links, self.ids = [], [], [], [], [], [], []
        self.capture = None
        self.svg = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'svg': self.svg += 1
        if tag in ('title', 'h1') and not self.svg: self.capture = [tag, []]
        if attrs.get('id'): self.ids.append(attrs['id'])
        if tag == 'link' and 'canonical' in attrs.get('rel', '').split(): self.canonical.append(attrs.get('href'))
        if tag == 'meta':
            if attrs.get('name', '').lower() in ('robots', 'googlebot'): self.robots.append(attrs.get('content', ''))
            if attrs.get('property') == 'og:image': self.og.append(attrs.get('content', ''))
        if tag == 'a' and attrs.get('href'): self.links.append(attrs['href'])
    def handle_data(self, value):
        if self.capture: self.capture[1].append(value)
    def handle_endtag(self, tag):
        if tag == 'svg': self.svg = max(0, self.svg - 1)
        if self.capture and tag == self.capture[0]:
            value = ' '.join(''.join(self.capture[1]).split())
            (self.titles if tag == 'title' else self.h1).append(value)
            self.capture = None

def fetch(path):
    assert path.startswith('/') and not path.startswith('//')
    url = BASE + path
    started = time.monotonic()
    result = {'path': path, 'requested': url}
    try:
        request = Request(url, headers={'User-Agent': 'Latech-local-read-only-QA/1.0', 'Accept': '*/*'})
        try: response = build_opener(LocalRedirect()).open(request, timeout=25)
        except HTTPError as error: response = error
        with response:
            body = response.read(8 * 1024 * 1024)
            result.update(status=response.status, finalUrl=response.geturl(), contentType=response.headers.get('content-type', ''), xRobotsTag=response.headers.get('x-robots-tag', ''), bytes=len(body))
        if 'text/html' in result['contentType']:
            page = Page(); page.feed(body.decode('utf-8', errors='replace'))
            result.update(title=page.titles, h1=page.h1, canonical=page.canonical, robots=page.robots, ogImages=page.og, links=page.links, ids=page.ids)
        elif body.startswith(b'\x89PNG\r\n\x1a\n') and len(body) >= 24:
            result['pngDimensions'] = list(struct.unpack('>II', body[16:24]))
        if path in ('/sitemap.xml', '/robots.txt'): result['text'] = body.decode('utf-8', errors='replace')
    except Exception as error:
        result['error'] = f'{type(error).__name__}: {error}'
    result['elapsedMs'] = round((time.monotonic() - started) * 1000)
    return result

report = {'startedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'origin': BASE, 'maxConcurrentRequests': 2, 'method': 'GET', 'excludedPrefix': '/blog/qa-editor-'}
report['localBuildId'] = Path('.next/BUILD_ID').read_text().strip()
with ThreadPoolExecutor(max_workers=2) as pool:
    sitemap, robots = list(pool.map(fetch, ['/sitemap.xml', '/robots.txt']))
    report.update(sitemap=sitemap, robots=robots)
    locations = [element.text for element in ET.fromstring(sitemap['text']).iter() if element.tag.endswith('}loc')]
    paths = sorted({local_path(location) for location in locations if local_path(location) and not local_path(location).startswith('/blog/qa-editor-')})
    report['excludedTemporaryUrls'] = [location for location in locations if '/blog/qa-editor-' in location]
    report['sitemapUrls'] = locations
    pages = list(pool.map(fetch, paths))
    report['pages'] = pages
    bypath = {page['path']: page for page in pages}
    labpages = [page for page in pages if page['path'] == '/lab' or page['path'].startswith('/lab/')]
    references = []
    for page in labpages:
        for href in page.get('links', []):
            absolute = urljoin(PUBLIC + page['path'], href)
            path = local_path(absolute)
            if path is not None and not path.startswith('/blog/qa-editor-'):
                references.append({'source': page['path'], 'href': href, 'path': path, 'fragment': urlsplit(absolute).fragment})
    extra_paths = sorted({reference['path'] for reference in references} - set(bypath))
    extra_pages = list(pool.map(fetch, extra_paths))
    bypath.update({page['path']: page for page in extra_pages})
    report['additionalLinkedPages'] = extra_pages
    report['labLinks'] = references
    with Path('docs/editorial/mapa-urls.csv').open(newline='') as editorial_file:
        editorial_paths = {local_path(row['url']) for row in csv.DictReader(editorial_file) if row['archivo'].strip()}
    report['editorialPaths'] = sorted(editorial_paths)
    newpages = labpages + [page for page in pages if page['path'] in editorial_paths or page['path'] in ('/briefing', '/tienda/calculadora')]
    ogpaths = sorted({local_path(url) for page in newpages for url in page.get('ogImages', []) if local_path(url)})
    report['ogImages'] = list(pool.map(fetch, ogpaths))
    report['privateChecks'] = list(pool.map(fetch, ['/blog/qa-private-draft', '/blog/qa-private-draft/opengraph-image', '/blog/qa-http-nonexistent-post']))

findings = []
for editorial_path in editorial_paths:
    if editorial_path not in {page['path'] for page in pages}: findings.append({'kind': 'editorial_missing_sitemap', 'path': editorial_path})
for page in pages:
    path = page['path']
    if page.get('status') != 200: findings.append({'kind': 'status', 'path': path, 'status': page.get('status'), 'error': page.get('error')}); continue
    for field in ('title', 'h1', 'canonical'):
        if len(page.get(field, [])) != 1 or not page[field][0]: findings.append({'kind': field + '_count', 'path': path, 'values': page.get(field, [])})
    expected = PUBLIC + ('' if path == '/' else path)
    if page.get('canonical') and page['canonical'][0].rstrip('/') != expected.rstrip('/'):
        findings.append({'kind': 'canonical_mismatch', 'path': path, 'values': page['canonical'], 'expected': expected})
    if 'noindex' in ' '.join(page.get('robots', []) + [page.get('xRobotsTag', '')]).lower(): findings.append({'kind': 'public_noindex', 'path': path})
for field in ('title', 'h1'):
    groups = defaultdict(list)
    for page in pages:
        if len(page.get(field, [])) == 1: groups[page[field][0]].append(page['path'])
    for value, duplicate_paths in groups.items():
        if len(duplicate_paths) > 1: findings.append({'kind': 'duplicate_' + field, 'value': value, 'paths': duplicate_paths})
for reference in references:
    target = bypath[reference['path']]
    if target.get('status') != 200: findings.append({'kind': 'lab_link_status', **reference, 'status': target.get('status')})
    if reference['fragment'] and reference['fragment'] not in target.get('ids', []): findings.append({'kind': 'lab_fragment_missing', **reference})
for asset in report['ogImages']:
    if asset.get('status') != 200 or not asset.get('contentType', '').startswith('image/'):
        findings.append({'kind': 'og_response', 'path': asset['path'], 'status': asset.get('status'), 'contentType': asset.get('contentType')})
    if asset.get('pngDimensions') and asset['pngDimensions'] != [1200, 630]: findings.append({'kind': 'og_dimensions', 'path': asset['path'], 'dimensions': asset['pngDimensions']})
for page in report['privateChecks']:
    if page.get('status') != 404: findings.append({'kind': 'private_status', 'path': page['path'], 'status': page.get('status')})
    if 'text/html' in page.get('contentType', '') and 'noindex' not in ' '.join(page.get('robots', []) + [page.get('xRobotsTag', '')]).lower(): findings.append({'kind': 'private_missing_noindex', 'path': page['path']})
if any('/blog/qa-private-draft' in location for location in locations): findings.append({'kind': 'draft_in_sitemap'})
report['findings'] = findings
if Path('.next/BUILD_ID').read_text().strip() != report['localBuildId']:
    findings.append({'kind': 'build_changed_during_crawl'})
report['completedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2))
print(json.dumps({'sitemapPages': len(pages), 'additionalLinkedPages': len(extra_pages), 'labLinkReferences': len(references), 'uniqueLabTargets': len({r['path'] for r in references}), 'ogImages': len(report['ogImages']), 'privateChecks': len(report['privateChecks']), 'findings': findings, 'report': str(OUT)}, ensure_ascii=False, indent=2))
