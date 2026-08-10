from app.core.security import hash_password, verify_password

password = "Ganesh123"

hashed = hash_password(password)

print("Hashed Password:")
print(hashed)

print("\nPassword Match:")
print(verify_password(password, hashed))