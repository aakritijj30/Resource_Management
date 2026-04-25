import urllib.request, json
data = json.dumps({'email': 'emp3@company.com', 'full_name': 'Lino Jose', 'password': 'password', 'role': 'employee', 'department_id': 4}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/auth/signup', data=data, headers={'Content-Type': 'application/json'})
try:
    res = urllib.request.urlopen(req)
    print(res.read())
except Exception as e:
    print(e.read().decode())
