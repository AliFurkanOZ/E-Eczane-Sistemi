"""
Verify all admin endpoints are registered
"""
import requests

BASE_URL = "http://127.0.0.1:8000"

print("\n" + "="*70)
print("STEP 6.6 VERIFICATION: Admin Router Registration")
print("="*70 + "\n")

try:
    # Get OpenAPI schema
    response = requests.get(f"{BASE_URL}/openapi.json")
    api_schema = response.json()
    
    # Filter admin endpoints
    admin_paths = {
        path: list(methods.keys()) 
        for path, methods in api_schema['paths'].items() 
        if path.startswith('/api/admin/')
    }
    
    # Display all routers
    print("📋 All Registered Routers:\n")
    routers = {}
    for path in api_schema['paths'].keys():
        prefix = '/'.join(path.split('/')[:3])  # Get /api/xxx
        if prefix not in routers:
            routers[prefix] = 0
        routers[prefix] += 1
    
    for i, (prefix, count) in enumerate(sorted(routers.items()), 1):
        status = "⭐" if "admin" in prefix else "✓"
        print(f"  {i}. {prefix}/* - {count} endpoints {status}")
    
    print("\n" + "="*70)
    print(f"Admin Endpoints Details: {len(admin_paths)} endpoints")
    print("="*70 + "\n")
    
    # Display admin endpoints
    for i, (path, methods) in enumerate(sorted(admin_paths.items()), 1):
        methods_str = ", ".join(m.upper() for m in methods)
        print(f"  {i:2d}. {path}")
        print(f"      Methods: {methods_str}\n")
    
    # Summary
    total_methods = sum(len(m) for m in admin_paths.values())
    
    print("="*70)
    print(f"✅ Total Admin Endpoints: {len(admin_paths)}")
    print(f"✅ Total HTTP Methods: {total_methods}")
    print("="*70)
    
    # Expected endpoints
    expected = [
        "/api/admin/profil",
        "/api/admin/dashboard",
        "/api/admin/dashboard/siparis-stats",
        "/api/admin/eczaneler/bekleyenler",
        "/api/admin/eczaneler",
        "/api/admin/eczaneler/{eczane_id}/onayla",
        "/api/admin/eczaneler/{eczane_id}/reddet",
        "/api/admin/eczaneler/{eczane_id}/durum",
        "/api/admin/hastalar",
        "/api/admin/hastalar/{hasta_id}/durum",
        "/api/admin/siparisler",
        "/api/admin/siparisler/{siparis_id}",
    ]
    
    print("\n📊 Completeness Check:\n")
    all_present = True
    for endpoint in expected:
        if endpoint in admin_paths:
            print(f"  ✓ {endpoint}")
        else:
            print(f"  ✗ {endpoint} - MISSING!")
            all_present = False
    
    print("\n" + "="*70)
    if all_present and len(admin_paths) >= 12:
        print("🎉 ALL ADMIN ENDPOINTS VERIFIED - STEP 6.6 COMPLETE!")
    else:
        print("⚠️  Some endpoints missing")
    print("="*70)
    
    print("\n📚 Access Admin Panel:")
    print(f"   Swagger UI: {BASE_URL}/docs#/Admin")
    print(f"   ReDoc: {BASE_URL}/redoc\n")
    
    print("📝 Admin Login Credentials:")
    print("   Email: admin@eczane.com")
    print("   Password: Admin123!")
    print("   User Type: admin\n")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nMake sure the server is running:")
    print("  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000\n")
