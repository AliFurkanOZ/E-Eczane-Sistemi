# -*- coding: utf-8 -*-
"""Veritabanindaki mevcut verileri goster"""
import sys
import os
import logging

# Logging'i kapat
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.models import (
    User, Hasta, Eczane, Admin, Doktor, 
    Ilac, MuadilIlac, Recete, ReceteIlac, Stok,
    Siparis, SiparisDetay, SiparisDurumGecmisi, Bildirim
)

def check_data():
    db = SessionLocal()
    output_lines = []
    
    def add(text):
        output_lines.append(text)
    
    try:
        add("=" * 60)
        add("VERITABANI MEVCUT VERILER")
        add("=" * 60)
        
        # Users
        users = db.query(User).all()
        add(f"\nUSERS (Kullanicilar): {len(users)} kayit")
        for u in users[:10]:
            add(f"   - {u.email} ({u.user_type.value})")
        if len(users) > 10:
            add(f"   ... ve {len(users) - 10} kayit daha")
        
        # Hastalar
        hastalar = db.query(Hasta).all()
        add(f"\nHASTALAR: {len(hastalar)} kayit")
        for h in hastalar[:5]:
            add(f"   - {h.ad} {h.soyad} (TC: {h.tc_no})")
        if len(hastalar) > 5:
            add(f"   ... ve {len(hastalar) - 5} kayit daha")
        
        # Eczaneler
        eczaneler = db.query(Eczane).all()
        add(f"\nECZANELER: {len(eczaneler)} kayit")
        for e in eczaneler[:5]:
            add(f"   - {e.eczane_adi} (Sicil: {e.sicil_no}, Durum: {e.onay_durumu.value})")
        if len(eczaneler) > 5:
            add(f"   ... ve {len(eczaneler) - 5} kayit daha")
        
        # Adminler
        adminler = db.query(Admin).all()
        add(f"\nADMINLER: {len(adminler)} kayit")
        for a in adminler:
            add(f"   - {a.ad} {a.soyad}")
        
        # Doktorlar
        doktorlar = db.query(Doktor).all()
        add(f"\nDOKTORLAR: {len(doktorlar)} kayit")
        for d in doktorlar[:5]:
            add(f"   - Dr. {d.ad} {d.soyad} (Diploma: {d.diploma_no})")
        if len(doktorlar) > 5:
            add(f"   ... ve {len(doktorlar) - 5} kayit daha")
        
        # Ilaclar
        ilaclar = db.query(Ilac).all()
        add(f"\nILACLAR: {len(ilaclar)} kayit")
        for i in ilaclar[:5]:
            add(f"   - {i.ad} ({i.barkod}) - {i.fiyat} TL")
        if len(ilaclar) > 5:
            add(f"   ... ve {len(ilaclar) - 5} kayit daha")
        
        # Muadil Ilaclar
        muadiller = db.query(MuadilIlac).all()
        add(f"\nMUADIL ILACLAR: {len(muadiller)} kayit")
        
        # Stoklar
        stoklar = db.query(Stok).all()
        add(f"\nSTOKLAR: {len(stoklar)} kayit")
        for s in stoklar[:5]:
            add(f"   - Ilac ID: {str(s.ilac_id)[:8]}... Miktar: {s.miktar}")
        if len(stoklar) > 5:
            add(f"   ... ve {len(stoklar) - 5} kayit daha")
        
        # Receteler
        receteler = db.query(Recete).all()
        add(f"\nRECETELER: {len(receteler)} kayit")
        for r in receteler[:5]:
            add(f"   - {r.recete_no} (TC: {r.tc_no}, Durum: {r.durum.value})")
        if len(receteler) > 5:
            add(f"   ... ve {len(receteler) - 5} kayit daha")
        
        # Recete Ilaclari
        recete_ilaclar = db.query(ReceteIlac).all()
        add(f"\nRECETE-ILAC ILISKILERI: {len(recete_ilaclar)} kayit")
        
        # Siparisler
        siparisler = db.query(Siparis).all()
        add(f"\nSIPARISLER: {len(siparisler)} kayit")
        for s in siparisler[:5]:
            add(f"   - {s.siparis_no} (Durum: {s.durum.value}, Tutar: {s.toplam_tutar} TL)")
        if len(siparisler) > 5:
            add(f"   ... ve {len(siparisler) - 5} kayit daha")
        
        # Siparis Detaylari
        siparis_detaylari = db.query(SiparisDetay).all()
        add(f"\nSIPARIS DETAYLARI: {len(siparis_detaylari)} kayit")
        
        # Siparis Durum Gecmisi
        durum_gecmisi = db.query(SiparisDurumGecmisi).all()
        add(f"\nSIPARIS DURUM GECMISI: {len(durum_gecmisi)} kayit")
        
        # Bildirimler
        bildirimler = db.query(Bildirim).all()
        add(f"\nBILDIRIMLER: {len(bildirimler)} kayit")
        
        add("\n" + "=" * 60)
        add("OZET")
        add("=" * 60)
        add(f"""
Toplam kayit sayilari:
- Users: {len(users)}
- Hastalar: {len(hastalar)}
- Eczaneler: {len(eczaneler)}
- Adminler: {len(adminler)}
- Doktorlar: {len(doktorlar)}
- Ilaclar: {len(ilaclar)}
- Muadil Ilaclar: {len(muadiller)}
- Stoklar: {len(stoklar)}
- Receteler: {len(receteler)}
- Recete Ilaclari: {len(recete_ilaclar)}
- Siparisler: {len(siparisler)}
- Siparis Detaylari: {len(siparis_detaylari)}
- Durum Gecmisi: {len(durum_gecmisi)}
- Bildirimler: {len(bildirimler)}
        """)
        
        # Dosyaya yaz
        result = "\n".join(output_lines)
        with open("db_report.txt", "w", encoding="utf-8") as f:
            f.write(result)
        print("Rapor db_report.txt dosyasina yazildi.")
        
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
