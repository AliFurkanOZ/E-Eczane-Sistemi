import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{reset_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Şifre Sıfırlama</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    🏥 E-Eczane Sistemi
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 24px; font-weight: 600;">
                                    Şifre Sıfırlama Talebi
                                </h2>
                                <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                    Merhaba,
                                </p>
                                <p style="margin: 0 0 30px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                    E-Eczane hesabınız için şifre sıfırlama talebinde bulundunuz. 
                                    Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:
                                </p>
                                
                                <!-- Button -->
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td align="center" style="padding: 20px 0;">
                                            <a href="{reset_link}" 
                                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                                Şifremi Sıfırla
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="margin: 30px 0 15px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                    Buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayın:
                                </p>
                                <p style="margin: 0 0 30px 0; word-break: break-all;">
                                    <a href="{reset_link}" style="color: #667eea; font-size: 14px;">
                                        {reset_link}
                                    </a>
                                </p>
                                
                                <!-- Warning -->
                                <div style="padding: 16px; background-color: #fff5f5; border-left: 4px solid #fc8181; border-radius: 4px; margin: 20px 0;">
                                    <p style="margin: 0; color: #c53030; font-size: 14px;">
                                        ⚠️ Bu link <strong>1 saat</strong> içinde geçerliliğini yitirecektir.
                                    </p>
                                </div>
                                
                                <p style="margin: 20px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                    Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz. 
                                    Hesabınız güvende kalacaktır.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 16px 16px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #a0aec0; font-size: 12px;">
                                    Bu e-posta E-Eczane Sistemi tarafından otomatik olarak gönderilmiştir.
                                </p>
                                <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                    © 2025 E-Eczane Sistemi. Tüm hakları saklıdır.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    text_content = f"""
    E-Eczane Sistemi - Şifre Sıfırlama
    
    Merhaba,
    
    E-Eczane hesabınız için şifre sıfırlama talebinde bulundunuz.
    
    Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:
    {reset_link}
    
    Bu link 1 saat içinde geçerliliğini yitirecektir.
    
    Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.
    
    E-Eczane Sistemi
    """
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "E-Eczane - Şifre Sıfırlama"
        msg["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
        msg["To"] = to_email
        
        part1 = MIMEText(text_content, "plain", "utf-8")
        part2 = MIMEText(html_content, "html", "utf-8")
        
        msg.attach(part1)
        msg.attach(part2)
        
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, to_email, msg.as_string())
        
        return True
        
    except Exception as e:
        print(f"E-posta gönderme hatası: {e}")
        return False


def send_order_status_email(
    to_email: str, 
    order_id: str, 
    status: str, 
    patient_name: str,
    cancel_reason: str = None,
    eczane_adi: str = None
) -> bool:
    """
    Sipariş durumu değişikliği e-postası gönder
    
    Args:
        to_email: Hasta e-posta adresi
        order_id: Sipariş ID
        status: Sipariş durumu (BEKLEMEDE, ONAYLANDI, HAZIRLANIYOR, YOLDA, TESLIM_EDILDI, IPTAL_EDILDI)
        patient_name: Hasta adı
        cancel_reason: İptal nedeni (sadece IPTAL_EDILDI durumu için)
        eczane_adi: Eczane adı
    
    Returns:
        bool: E-posta başarıyla gönderildiyse True
    """
    status_messages = {
        "BEKLEMEDE": {
            "title": "Siparişiniz Alındı 🛒",
            "message": f"Siparişiniz başarıyla oluşturuldu ve {eczane_adi or 'eczane'} tarafından onay bekliyor.",
            "color": "#3182ce",
            "icon": "🛒"
        },
        "ONAYLANDI": {
            "title": "Siparişiniz Onaylandı! ✅",
            "message": f"{eczane_adi or 'Eczane'} siparişinizi onayladı ve hazırlama işlemine başlıyor.",
            "color": "#48bb78",
            "icon": "✅"
        },
        "HAZIRLANIYOR": {
            "title": "Siparişiniz Hazırlanıyor 📦",
            "message": f"{eczane_adi or 'Eczane'} siparişinizi hazırlıyor. Kısa süre içinde yola çıkacak.",
            "color": "#ed8936", 
            "icon": "📦"
        },
        "YOLDA": {
            "title": "Siparişiniz Yolda! 🚚",
            "message": "Siparişiniz kargoya verildi ve size doğru yola çıktı. Teslimat için hazır olun!",
            "color": "#4299e1",
            "icon": "🚚"
        },
        "TESLIM_EDILDI": {
            "title": "Siparişiniz Teslim Edildi! 🎉",
            "message": "Siparişiniz başarıyla teslim edildi. Geçmiş olsun, sağlıklı günler dileriz! İyi günlerde kullanın.",
            "color": "#9f7aea",
            "icon": "🎉"
        },
        "IPTAL_EDILDI": {
            "title": "Siparişiniz İptal Edildi ❌",
            "message": f"Siparişiniz iptal edilmiştir.{(' İptal nedeni: ' + cancel_reason) if cancel_reason else ''} Ödemeniz iade edilecektir.",
            "color": "#e53e3e",
            "icon": "❌"
        }
    }
    
    status_info = status_messages.get(status, {
        "title": f"Sipariş Durumu: {status}",
        "message": "Siparişinizin durumu güncellendi.",
        "color": "#667eea",
        "icon": "📋"
    })
    
    # İptal durumunda özel uyarı kutusu
    cancel_box = ""
    if status == "IPTAL_EDILDI" and cancel_reason:
        cancel_box = f"""
                                <div style="padding: 16px; background-color: #fff5f5; border-left: 4px solid #fc8181; border-radius: 4px; margin: 20px 0;">
                                    <p style="margin: 0; color: #c53030; font-size: 14px;">
                                        <strong>İptal Nedeni:</strong> {cancel_reason}
                                    </p>
                                </div>
        """
    
    # Teslim edildi durumunda geçmiş olsun kutusu
    gecmis_olsun_box = ""
    if status == "TESLIM_EDILDI":
        gecmis_olsun_box = """
                                <div style="padding: 20px; background-color: #f0fff4; border-left: 4px solid #48bb78; border-radius: 4px; margin: 20px 0; text-align: center;">
                                    <p style="margin: 0; color: #276749; font-size: 16px; font-weight: 600;">
                                        💚 Geçmiş Olsun, Sağlıklı Günler Dileriz!
                                    </p>
                                </div>
        """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sipariş Durumu</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    🏥 E-Eczane Sistemi
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <span style="font-size: 64px;">{status_info['icon']}</span>
                                </div>
                                
                                <h2 style="margin: 0 0 20px 0; color: {status_info['color']}; font-size: 24px; font-weight: 600; text-align: center;">
                                    {status_info['title']}
                                </h2>
                                
                                <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                    Merhaba {patient_name},
                                </p>
                                <p style="margin: 0 0 30px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                    {status_info['message']}
                                </p>
                                
                                <!-- Order Info -->
                                <div style="padding: 20px; background-color: #f7fafc; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 14px;">
                                        <strong>Sipariş No:</strong> #{order_id[:8].upper()}
                                    </p>
                                    {f'<p style="margin: 0; color: #4a5568; font-size: 14px;"><strong>Eczane:</strong> {eczane_adi}</p>' if eczane_adi else ''}
                                </div>
                                
                                {cancel_box}
                                {gecmis_olsun_box}
                                
                                <!-- Button -->
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td align="center" style="padding: 20px 0;">
                                            <a href="{settings.FRONTEND_URL}/hasta/siparisler" 
                                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                                Siparişlerimi Görüntüle
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 16px 16px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #a0aec0; font-size: 12px;">
                                    Bu e-posta E-Eczane Sistemi tarafından otomatik olarak gönderilmiştir.
                                </p>
                                <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                    © 2025 E-Eczane Sistemi. Tüm hakları saklıdır.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    # Plain text version
    cancel_text = f"\nİptal Nedeni: {cancel_reason}" if cancel_reason else ""
    gecmis_olsun_text = "\n\n💚 Geçmiş Olsun, Sağlıklı Günler Dileriz!" if status == "TESLIM_EDILDI" else ""
    
    text_content = f"""
    E-Eczane Sistemi - Sipariş Durumu
    
    Merhaba {patient_name},
    
    {status_info['title']}
    
    {status_info['message']}
    
    Sipariş No: #{order_id[:8].upper()}
    {f'Eczane: {eczane_adi}' if eczane_adi else ''}{cancel_text}{gecmis_olsun_text}
    
    Siparişlerinizi görüntülemek için: {settings.FRONTEND_URL}/hasta/siparisler
    
    E-Eczane Sistemi
    """
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"E-Eczane - {status_info['title']}"
        msg["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
        msg["To"] = to_email
        
        part1 = MIMEText(text_content, "plain", "utf-8")
        part2 = MIMEText(html_content, "html", "utf-8")
        
        msg.attach(part1)
        msg.attach(part2)
        
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, to_email, msg.as_string())
        
        return True
        
    except Exception as e:
        print(f"E-posta gönderme hatası: {e}")
        return False

