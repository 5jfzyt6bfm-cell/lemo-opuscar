import re
REP = {'150': 'one hundred fifty', '1990s': 'nineteen nineties', '2022': 'twenty twenty two', '1991': 'nineteen ninety one', 'B1': 'b one'}
def words(s):
    for k, v in REP.items(): s = s.replace(k, v)
    s = s.replace('-', ' ')
    return [w for w in re.findall(r"[a-z']+", s.lower())]
