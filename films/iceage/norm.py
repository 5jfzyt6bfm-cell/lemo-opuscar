import re
REP = {'2018': 'twenty eighteen', '2021': 'twenty twenty one', '1821': 'eighteen twenty one', '2020': 'twenty twenty'}
def words(s):
    for k, v in REP.items(): s = s.replace(k, v)
    s = s.replace('-', ' ')
    return [w for w in re.findall(r"[a-z']+", s.lower())]
