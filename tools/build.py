#!/usr/bin/env python3
"""Пересборка порта из оригинального jar:  python3 tools/build.py WarStr.jar
Результат: game.js (байткод → JS) и data.js (ресурсы игры) рядом с index.html."""
import sys,os,zipfile,base64,json,tempfile,shutil
here=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,here)
import jvm2js
jar=sys.argv[1];root=os.path.dirname(here);tmp=tempfile.mkdtemp()
z=zipfile.ZipFile(jar);res={}
for i in z.infolist():
    if i.filename.endswith('/'):continue
    p=os.path.join(tmp,i.filename);os.makedirs(os.path.dirname(p),exist_ok=True);d=z.read(i);open(p,'wb').write(d)
    if not(i.filename.endswith('.class') or i.filename.startswith(('META-INF','crk'))):res[i.filename]=base64.b64encode(d).decode()
os.chdir(tmp);jvm2js.compile_all('.',os.path.join(root,'game.js'))
open(os.path.join(root,'data.js'),'w').write('window.RT=window.RT||{};RT.RES='+json.dumps(res)+';')
shutil.rmtree(tmp)
