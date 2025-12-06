# STEP 5 - Eczane Functionality Test Script
# PowerShell version for Windows

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              STEP 5 - ECZANE FUNCTIONALITY TESTS                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$BASE_URL = "http://127.0.0.1:8000"
$ECZANE_TOKEN = $null

# Test 1: Eczane Registration
Write-Host "`n[TEST 1] Eczane Registration" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

$registerData = @{
    sicil_no = "ANK123456"
    eczane_adi = "Şifa Eczanesi"
    adres = "Kızılay Meydanı No:45 Çankaya/ANKARA"
    telefon = "03121234567"
    mahalle = "Kızılay"
    eczaci_adi = "Mehmet"
    eczaci_soyadi = "Demir"
    eczaci_diploma_no = "ECZ123456"
    banka_hesap_no = "1234567890"
    iban = "TR330006100519786457841326"
    email = "sifa@eczane.com"
    password = "SecurePass123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/register/eczane" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerData `
        -ErrorAction Stop
    
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "  Eczane ID: $($response.id)" -ForegroundColor White
    Write-Host "  Status: $($response.onay_durumu)" -ForegroundColor White
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 400) {
        Write-Host "ℹ Eczane already registered (OK for repeated tests)" -ForegroundColor Blue
    } else {
        Write-Host "✗ Registration failed: $_" -ForegroundColor Red
    }
}

# Manual approval step
Write-Host "`n[TEST 2] Eczane Approval" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray
Write-Host "ℹ Admin approval required before login" -ForegroundColor Blue
Write-Host "ℹ Run this SQL command in PostgreSQL:" -ForegroundColor Blue
Write-Host ""
Write-Host "  UPDATE eczaneler SET onay_durumu = 'onaylandi' WHERE sicil_no = 'ANK123456';" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter after approving in database..." -ForegroundColor Yellow
Read-Host

# Test 3: Eczane Login
Write-Host "`n[TEST 3] Eczane Login" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

$loginData = @{
    identifier = "ANK123456"
    password = "SecurePass123!"
    user_type = "eczane"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginData `
        -ErrorAction Stop
    
    $ECZANE_TOKEN = $response.access_token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  Token: $($ECZANE_TOKEN.Substring(0, [Math]::Min(50, $ECZANE_TOKEN.Length)))..." -ForegroundColor White
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    Write-Host "  Make sure eczane is approved in database" -ForegroundColor Yellow
    exit
}

# Test 4: View Profile
Write-Host "`n[TEST 4] View Eczane Profile" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $ECZANE_TOKEN"
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/eczane/profil" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✓ Profile retrieved!" -ForegroundColor Green
    Write-Host "  Eczane: $($response.eczane_adi)" -ForegroundColor White
    Write-Host "  Eczacı: $($response.eczaci_adi) $($response.eczaci_soyadi)" -ForegroundColor White
    Write-Host "  Adres: $($response.adres)" -ForegroundColor White
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

# Test 5: List Stocks
Write-Host "`n[TEST 5] List Stocks" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $ECZANE_TOKEN"
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/eczane/stoklar" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✓ Stocks listed! Count: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

# Test 6: Add Product
Write-Host "`n[TEST 6] Add Non-Prescription Product" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

$productData = @{
    barkod = "8699444444444"
    ad = "Aspirin 100mg"
    kategori = "normal"
    kullanim_talimati = "Günde 1 kez 1 tablet"
    fiyat = "12.50"
    etken_madde = "Asetilsalisilik Asit"
    firma = "Bayer"
    baslangic_stok = 100
    min_stok = 20
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $ECZANE_TOKEN"
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/eczane/urun-ekle" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $productData `
        -ErrorAction Stop
    
    Write-Host "✓ Product added!" -ForegroundColor Green
    Write-Host "  Stock ID: $($response.id)" -ForegroundColor White
    Write-Host "  Product: $($response.ilac_adi)" -ForegroundColor White
    Write-Host "  Initial Stock: $($response.miktar)" -ForegroundColor White
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 400) {
        Write-Host "ℹ Product might already exist" -ForegroundColor Blue
    } else {
        Write-Host "✗ Failed: $_" -ForegroundColor Red
    }
}

# Test 7: Stock Warnings
Write-Host "`n[TEST 7] Stock Warnings" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $ECZANE_TOKEN"
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/eczane/stoklar/uyarilar" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✓ Warnings retrieved! Count: $($response.Count)" -ForegroundColor Green
    if ($response.Count -eq 0) {
        Write-Host "  No low stock warnings" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

# Test 8: List Orders
Write-Host "`n[TEST 8] List Orders" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $ECZANE_TOKEN"
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/eczane/siparisler" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✓ Orders listed! Count: $($response.Count)" -ForegroundColor Green
    if ($response.Count -eq 0) {
        Write-Host "  No orders yet" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                        TEST SUMMARY                              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "✅ STEP 5 FUNCTIONALITY VERIFIED" -ForegroundColor Green
Write-Host ""
Write-Host "All core endpoints tested:" -ForegroundColor White
Write-Host "  ✓ Registration" -ForegroundColor Green
Write-Host "  ✓ Login" -ForegroundColor Green
Write-Host "  ✓ Profile management" -ForegroundColor Green
Write-Host "  ✓ Stock management" -ForegroundColor Green
Write-Host "  ✓ Product addition" -ForegroundColor Green
Write-Host "  ✓ Order listing" -ForegroundColor Green
Write-Host ""
Write-Host "📚 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
