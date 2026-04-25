from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)
data = {'email': 'emp4@company.com', 'full_name': 'Lino Jose', 'password': 'password', 'role': 'employee', 'department_id': 4}
response = client.post('/auth/signup', json=data)
print(response.status_code)
print(response.json())
