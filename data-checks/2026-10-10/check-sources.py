import concurrent.futures,json,subprocess,hashlib,csv,io,tempfile
from pathlib import Path
from datetime import datetime,timezone
from urllib.parse import urlencode
root=Path(__file__).resolve().parents[2]
out=Path(tempfile.mkdtemp(prefix='gold-source-check-'))
print('Evidence output:',out,flush=True)
policy=json.loads((root/'app/data/source-policy.json').read_text())
prev=json.loads((root/'data-checks/2026-10-09/check-results.json').read_text())
queries=[{'name':x['file'],'url':x['url']} for x in prev['checks'] if x['file'].startswith('availability-')]
queries += [{'name':name,'url':url} for name,url in {
'lbma-vault.html':policy['sources']['lbma-vault']['url'],
'lbma-vault-sep.xlsx':'https://cdn.lbma.org.uk/downloads/LBMA-London-Vault-Holdings-Data-September-2026.xlsx',
'sge-monthly.html':policy['sources']['sge-month']['url'],
'sge-september.pdf':'https://www.sge.com.cn/upload/file/202610/09/9e6b4a569aeb41149beed7619cad377f.pdf',
'sge-daily.html':'https://www.sge.com.cn/sjzx/mrhqsj',
'sge-october09.html':'https://www.sge.com.cn/sjzx/quotation_daily_new?start_date=2026-10-09&end_date=2026-10-09',
'ecb-90d.xml':policy['sources']['ecb-fx']['fetchUrl'],
'cme-gold-stocks.xls':policy['sources']['cme-stocks']['fetchUrl'],
'cme-directory.html':policy['sources']['cme-stocks']['url'],
'lbma-gold-pm.json':policy['sources']['lbma-legacy']['fetchUrl'],
'swiss-import.csv':policy['sources']['bazg-import']['fetchUrl'],
'hmrc-august.json':'https://api.uktradeinfo.com/OTS?'+urlencode({'$filter':'MonthId eq 202608 and CommodityId ge 71080000 and CommodityId lt 71090000'}),
'hmrc-july.json':'https://api.uktradeinfo.com/OTS?'+urlencode({'$filter':'MonthId eq 202607 and CommodityId ge 71080000 and CommodityId lt 71090000'}),
'hk-gold-august.json':'https://tradeidds.censtatd.gov.hk/api/get?'+urlencode({'lang':'EN','sv':'QCm,VCm','freq':'M','period':'202608,202608','ttype':'4','codeclass':'HKHS6','code':'710812'}),
'census-august.json':'https://api.census.gov/data/timeseries/intltrade/exports/hs?get=ALL_VAL_MO,NET_WGT_MO,CTY_NAME&time=2026-08&E_COMMODITY=7108',
}.items()]
def check(q):
    f=out/q['name'];res={'name':q['name'],'url':q['url'],'checkedAt':datetime.now(timezone.utc).isoformat()}
    cmd=['curl','-L','--connect-timeout','10','--max-time','35','--max-filesize','50000000','-sS','-o',str(f),'-w','%{http_code}',q['url']]
    p=subprocess.run(cmd,capture_output=True,text=True)
    res.update(httpStatus=p.stdout.strip(),exitCode=p.returncode,error=p.stderr.strip()[:300])
    if f.exists():
      data=f.read_bytes();res.update(bytes=len(data),sha256=hashlib.sha256(data).hexdigest())
      if res['httpStatus']=='200':
       try:
        j=json.loads(data);res['rows']=len(j.get('data',j.get('value',[]))) if isinstance(j,dict) else len(j);res['applicationError']=j.get('error') if isinstance(j,dict) else None
        if isinstance(j,dict):res['nextLink']=j.get('@odata.nextLink')
       except Exception:pass
    print(json.dumps(res,ensure_ascii=False),flush=True)
    return res
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(check,queries))
(out/'check-results.json').write_text(json.dumps({'checkedAt':datetime.now(timezone.utc).isoformat(),'checks':results},ensure_ascii=False,indent=2)+'\n')
