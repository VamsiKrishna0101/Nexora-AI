import requests
res = requests.post("http://localhost:8001/api/persona/deep-dive", json={"name":"Sundar Pichai","designation":"CEO","company":"Google","linkedin_url":"https://www.linkedin.com/in/sundarpichai","twitter_handle":"@sundarpichai"})
print(res.status_code)
print(res.json())
