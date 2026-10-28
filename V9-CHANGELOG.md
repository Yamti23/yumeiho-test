# Yumeiho v9 — İyileştirme ve test raporu

28 Ekim 2026 · Yerel proje güncellendi; internete yayın yapılmadı.

## 1. Design & Aesthetics

- Siyah/altın palet, ana anatomik görsel ve serif başlık kimliği korundu.
- Üst menü 13 px, ana okuma metni 16 px; seans giriş metni masaüstünde 20 px, mobilde 18 px oldu.
- Bölümlerin boşlukları ve başlık boyutları dengelendi. Uzman portresi, orijinal dosyayı büyütmeden daha küçük bir çerçeveye alındı.
- Mobil hero normal belge akışında düzenlendi. Ara genişlikteki menü düğmesinin grid hizası düzeltilip 1200 px’de yeniden görüntülendi.

## 2. Usability & UX

- Seans, masaüstü ve mobil menüye ve sağ bölüm navigasyonuna eklendi.
- Yedi bölümün numarası ve aktif bölüm sayacı ortak kaynaktan çalışıyor.
- Seans ve eğitim niyetleri ilk ekranda ayrıldı. Eğitim kartı ve seans CTA’sı iletişimde doğru talep türünü seçiyor.
- Yöntem ayrıntıları ve uzun sinematik hikâye isteğe bağlı açılan alanlara taşındı. Bağlantıyla yöntem ayrıntısına gidildiğinde içerik açılıyor.
- Teknik GLB yükleme ve katman araçları gelişmiş alanın arkasına alındı.

## 3. Creativity & Innovation

- Anatomi atölyesi “Bir beden. Üç ilişki.” anlatısına dönüştü.
- Pelvis / Omurga / Kaslar seçimleri numaralı kartlarla sunuluyor. Bölge değişiminde açıklama ve ilişki notu değişiyor.
- Keşiften seans sürecine anlamlı bir bağlantı eklendi.
- Sinematik kaydırma deneyimi korunuyor; ana hizmet akışını zorunlu olarak uzatmıyor.

## 4. Developer & Technical Craft

- İkinci WebGL renderer yalnızca sinematik hikâye açılınca oluşturuluyor; kapanınca dispose ve context loss ile bırakılıyor, canvas kaldırılıyor.
- Mobilde antialias kapalı; piksel oranı üst sınırı 1,25, masaüstünde 1,5. Gerçek oran cihaz DPR değeri daha düşükse onunla sınırlı.
- Model kaynağı sabit revizyona bağlandı: 320805e06aee51e2e6f6b22533eb2a59d43f2d4d. Dinamik main referansı kaldırıldı.
- Görünürlük ve ihtiyaç olduğunda çizim yaklaşımı korundu. Kaldırılan bölümün GSAP animasyonu da kaldırılarak konsol uyarısı düzeltildi.
- Eski CSS yalnızca boşluk biçimlendirmesiyle okunur hale getirildi; kural sırası korunuyor. Yeni bileşen düzenlemeleri refinements.css içinde gruplandı. Eski yinelenen kuralların tamamı kaldırılmış değildir.
- Normal kullanımda kapalı olan ?diagnostics=1 sayaçları, çizim davranışını yerel olarak test etmeyi sağlıyor.

## 5. Content Strategy & Copywriting

- Aynı fikirleri tekrar eden uzun açıklamalar kısaltıldı. Seans girişi doğrudan ilk görüşmeyi anlatıyor.
- Seans ve eğitim için ayrı SSS yazıldı. Ön görüşme hazırlığı üç somut başlığa ayrıldı.
- Teknik repertuvarın kaynak farkı ana hizmet anlatısından kaynak detayına taşındı.
- İletişim seçimi konuya uygun e-posta taslağı hazırlıyor. Mesaj gönderilmedi; arama yapılmadı. Randevunun karşılıklı teyit gerektirdiği açıklandı.
- Temsilcilik ve 5. Dan kayıt bağlantıları korundu. Deneyim yılı, unvan, tarih, adres, ücret veya süre uydurulmadı.

## Test sonuçları

- JavaScript: script.js ve anatomy3d.js için node --check geçti.
- Statik HTML: 41 dahili bağlantıda eksik hedef yok. Yinelenen ID ve eksik yerel varlık yok.
- 320, 390, 768, 1024, 1200, 1440, 1920 px genişliklerinde yatay taşma yok.
- 1200 px menü açılıyor; düğme sağda. Mobil menü bağlantısı menüyü kapatıyor; Escape kapanışı çalışıyor.
- Yöntem bağlantısı kapalı ayrıntıyı açıyor. Seans SSS’si ve gelişmiş araçlar Enter ile açılıp kapanıyor.
- Kas katmanı aç/kapat; üç bölge seçimi; canvas ArrowRight ve Home kontrolleri denendi.
- Eğitim kartından iletişime gidildiğinde eğitim talebi ve ilgili mailto taslağı seçiliyor. Radyo seçimi klavyeyle çalışıyor.
- 634 parçalı model yüklendi. Sinematik hikâye kapalı/açık/kapalı/yeniden açık/kapalı yaşam döngüsünde canvas sayısı 1/2/1/2/1.
- Son normal oturum uyarı/hata kayıtları boş. Bu bütün koşullarda hatasızlık garantisi değildir.

## Ölçülen değişim ve sınırlar

Varsayılan kapalı ayrıntılarla, 900 px ekran yüksekliğinde belge uzunluğu:
- Masaüstü 1440 px: 13.024 → 8.138 px; yaklaşık %37,5 azalma.
- Mobil 390 px: 19.183 → 12.583 px; yaklaşık %34,4 azalma.

Bu bir hız veya dönüşüm ölçümü değildir. Ayrıntılar açıldığında belge yeniden uzar; içerik keşfedilebilir kalır.

Yerel tanılama örneğinde boşta ek çizim sayısı 0. Otomatik döndürmede yaklaşık 60 renderer gönderimi/saniye; ölçüm aralığında ortalama CPU gönderim süresi yaklaşık 6,35 ms. Her çizimde 634 draw call görülüyor: modelin birleştirilmesi/LOD gibi ileri optimizasyonlar için hâlâ alan var. Bu sonuç GPU’nun ekrana sunduğu gerçek FPS değildir; ilk yükleme/shader maliyetlerini veya düşük güçlü telefonları temsil etmez. Ayrıntılar render-diagnostics.json dosyasında.

LCP/INP/CLS, gerçek Android/iPhone performansı, ekran okuyucu, 200–400% büyütme ve işletim sistemi reduced-motion testi bu turda ölçülmedi. Tam WCAG uyumu veya Awwwards/FWA ödül seviyesi iddia edilmiyor.

## Dışarıdan gereken özgün içerikler

Yeni profesyonel portre/uygulama videosu mevcut olmadığı için üretilmiş bir kişi veya sahte seans fotoğrafı eklenmedi. Güncel seans yeri, süre, ücret, hazırlık ve eğitim takvimi doğrulanınca ilgili içerik tamamlanabilir. Bu bilgilerin yokluğu kod değişikliğiyle giderilemez. CEKIM-VE-BILGI-BRIFI.md somut üretim listesini içerir.

## Görüntü karşılaştırması

01/02 eski masaüstü; 03/04 ilk uygulanmış karşılaştırma; 05–09 anatomi, sinematik sahne, uzman, eğitim, iletişim; 12/13/14/15 mobil son durum; 17 ara genişlik son menü; 18 son masaüstü. 10 mobil hero ara denemesi ve 16 ilk ara genişlik menüsü nihai sonuç olarak kullanılmadı.
