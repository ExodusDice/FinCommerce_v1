import json
import csv
import random
import os

# Lists of common Thai first names, last names, and company types
first_names = [
    "Somchai", "Anong", "Kitti", "Prasert", "Suchart", "Natthapong", "Prapas", "Sunisa", "Malee", 
    "Siriporn", "Kanya", "Santi", "Vichai", "Chaiwat", "Arun", "Somsak", "Suda", "Pornpen", "Wanchai", 
    "Suthep", "Nonglak", "Udom", "Prayut", "Niran", "Somporn", "Veera", "Narong", "Preecha", "Surachai"
]

last_names = [
    "Prasert", "Srisai", "Chaiya", "Somboon", "Suksamran", "Rakdee", "Wattana", "Boonsoong", "Thongdee",
    "Jitdee", "Saengkaew", "Srisawat", "Rattanamanee", "Kaewmanee", "Sukumara", "Phanklang", "Chanthara",
    "Phonphibun", "Sirisawat", "Maneerat", "Prommee", "Khamdee", "Duangdee", "Bunmee", "Pornprasert"
]

company_suffixes = [
    "Retail", "Boutique", "Electronics", "Siam Shop", "Bangkok Trading", "Market", "Store", "Fashion",
    "Digital", "House", "Enterprise", "Global", "Express", "Online", "Supply", "Products", "Distributors"
]

plans = ["Free", "Basic", "Advance"]

# Generate 100 records
mock_merchants = []
random.seed(42)  # For deterministic output

generated_emails = set()

for i in range(1, 101):
    first = random.choice(first_names)
    last = random.choice(last_names)
    # Ensure email uniqueness
    email = f"{first.lower()}.{last.lower()}{i}@gmail.com"
    if email in generated_emails:
        email = f"{first.lower()}.{last.lower()}{i}_alt@gmail.com"
    generated_emails.add(email)
    
    phone = f"0{random.choice([6, 8, 9])}{random.randint(10000000, 99999999)}"
    company = f"{first} {random.choice(company_suffixes)}"
    plan = random.choice(plans)
    
    # Store count based on plan
    if plan == "Free":
        store_count = 1
    elif plan == "Basic":
        store_count = random.randint(2, 3)
    else:
        store_count = random.randint(3, 10)
        
    merchant = {
        "id": i,
        "full_name": f"{first} {last}",
        "email": email,
        "phone": phone,
        "company_name": company,
        "subscription_plan": plan,
        "linked_stores_count": store_count
    }
    mock_merchants.append(merchant)

# Paths
docs_dir = os.path.dirname(__file__)
web_dir = os.path.abspath(os.path.join(docs_dir, "..", "web"))

csv_path = os.path.join(docs_dir, "test_merchants_100.csv")
json_path = os.path.join(web_dir, "test_merchants_100.json")

# Write CSV
with open(csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["id", "full_name", "email", "phone", "company_name", "subscription_plan", "linked_stores_count"])
    writer.writeheader()
    writer.writerows(mock_merchants)

# Write JSON
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(mock_merchants, f, indent=2, ensure_ascii=False)

print(f"Generated 100 mock merchant records successfully!")
print(f"CSV written to: {csv_path}")
print(f"JSON written to: {json_path}")
