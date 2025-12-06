from enum import Enum


class UserType(str, Enum):
    HASTA = "hasta"
    ECZANE = "eczane"
    ADMIN = "admin"


class OnayDurumu(str, Enum):
    BEKLEMEDE = "beklemede"
    ONAYLANDI = "onaylandi"
    REDDEDILDI = "reddedildi"


class IlacKategori(str, Enum):
    NORMAL = "normal"
    KIRMIZI_RECETE = "kirmizi_recete"
    SOGUK_ZINCIR = "soguk_zincir"


class SiparisDurum(str, Enum):
    BEKLEMEDE = "beklemede"
    ONAYLANDI = "onaylandi"
    HAZIRLANIYOR = "hazirlaniyor"
    YOLDA = "yolda"
    TESLIM_EDILDI = "teslim_edildi"
    IPTAL_EDILDI = "iptal_edildi"


class OdemeDurum(str, Enum):
    BEKLEMEDE = "beklemede"
    ODENDI = "odendi"
    IADE_EDILDI = "iade_edildi"


class BildirimTip(str, Enum):
    SIPARIS = "siparis"
    SISTEM = "sistem"
    ODEME = "odeme"


class ReceteDurum(str, Enum):
    AKTIF = "aktif"
    KULLANILDI = "kullanildi"
    IPTAL = "iptal"


