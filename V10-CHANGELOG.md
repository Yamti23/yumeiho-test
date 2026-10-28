# Yumeiho v10 — İmza deneyim ve teknik iyileştirmeler

28 Ekim 2026. Yerel proje güncellendi. Ödül puanı veya 10/10 sonucu iddia edilmez; internet yayını yapılmadı.

## Uygulananlar

### Tasarım
- Hero’da yalnızca opaklıkla değişen düşük yoğunluklu bronz ışık; otomatik 3D döndürme sırasında hafif rim light değişimi.
- Teknik etiketlerde yerel monospace yazı ailesi; yeni font dosyası yükü yok.
- Portrede sinematik siyah-beyaz/sıcak tonlama; mevcut kimlik ve gerçek kişi korundu.
- Bölüm başlıklarında 14 px ile sınırlı kaydırma hareketi. Hareket azaltıldığında GSAP bağlamı geri alınıyor, CSS animasyonları duruyor.

### Kullanılabilirlik
- Seans ve eğitim CTA’larından iletişime giden kullanıcı için önceki bölüm ve kaydırma konumuna dönüş düğmesi.
- Normal tarayıcı geri/ileri kaydırma davranışı korunuyor. Kaydırma zorla JavaScript’e taşınmadı.
- Düğmelerde kısa görsel geri bildirim; otomatik ses ve titreşim eklenmedi.
- Kullanıcının “Hareketi azalt” seçimi bu sekmede hatırlanıyor. Sistem tercihi de gözetiliyor. Bu durumda otomatik 3D döndürme devre dışı.

### Yaratıcılık
- /laboratuvar/: iki yük ve uzaklık kontrolüyle kuvvet ve moment ilişkisini anlatan çalışan deney.
- Kontroller klavyeyle kullanılabiliyor; sayısal sonuç ve metinsel karşılık üretiliyor, başlangıç değerlerine dönülebiliyor.
- İnsan omurgası deformasyonu veya skolyoz sonucu üretilmiyor. Matematiksel mekanik deneyin sınırı açıkça belirtiliyor.

### Teknik
- Kaynak modeldeki 634 parça, anatomik grup ve ortak malzemeye göre 4 geometri grubunda birleştiriliyor.
- Dönüşümler geometriye işleniyor; GLTF normalize/quantize attribute değerleri önce Float32’ye dönüştürülüyor. Vertex renkleri, bölge seçimi ve katmanlar korunuyor.
- Varsayılan tam modelde draw call: 634 → 4, yaklaşık %99,4 azalma. Kaslar kapalıyken 3.
- InstancedMesh, farklı anatomik geometrileri tekrar eden aynı geometri gibi ele almak için kullanılmadı. Draco eklenmedi; kaynak zaten Meshopt sıkıştırmalı. Geometri gruplaması çizim sayısını düşüren asıl değişiklik.
- 6.004.016 baytlık sabit kaynak model yerel pakete lisans/atıf dosyasıyla eklendi. Varsayılan yükleme yerel modeli tercih ediyor. CDN sürümü sabit yedek kaynak olarak korunuyor.
- Hero görseline preload eklendi. 6 MB model ilk ekranı zorlamamak için hâlâ anatomi bölümüne yaklaşınca yükleniyor.
- Loader yalnızca gerçek byte toplamı biliniyorsa yüzde gösteriyor; aksi halde belirsiz ilerleme. Yükleme tamamlanınca gizleniyor; sahte zamanlayıcı yüzdesi yok.
- Eski modelin geometri/malzeme/texture kaynakları benzersiz kümeler üzerinden serbest bırakılıyor. İkinci sinematik renderer yalnızca istenince açılıyor ve kapanınca bırakılıyor.

### İçerik
- /egitim/: temsilcilik ve 5. Dan kayıtları, 1/2/3 Dan karşılaştırması, katılım, saatler, değerlendirme, belge, ücret ve kayıt soruları.
- Tablo genel yöntem çerçevesini anlatıyor; güncel Türkiye takvimi, ücret veya yeni mesleki yetki uydurulmadı.
- Eğitim sayfasından iletişime geçildiğinde eğitim niyeti ve ilgili e-posta taslağı seçiliyor.
- Saionji kökeni ve pelvis odaklı yaklaşım korunuyor. Kaynakların yaklaşık 100 / 120 farkı varken tek bir kesin teknik sayısı otorite ifadesi olarak dayatılmadı.

## Test kanıtı

1. Model: 634 kaynak parça → 4 batch → 4 draw call. Pelvis seçimi, kas katmanı kapatma/açma ve renkler görsel olarak kontrol edildi.
2. Kararlı döndürme örneği: yaklaşık 60 renderer gönderimi/saniye; ortalama CPU gönderim maliyeti yaklaşık 0,89 ms. Bu presented GPU FPS veya gerçek telefon testi değildir. İlk shader derleme ve yükleme maliyeti bu kararlı örneği temsil etmez.
3. İki yeniden yüklemede GPU sayaçları sabit: 27 geometri, 5 shader programı, 0 texture. Bu bounded test kapsamlı bellek sızıntısı yokluğu garantisi değildir.
4. Sinematik sahne kapalı/açık/kapalı: 1/2/1 canvas. Kapalıyken ikinci renderer tutulmuyor.
5. Hareket azaltma: root reduced, hero animation none, otomatik döndürme disabled; sayfa yenilendikten sonra tercih korunuyor. Test sonunda full moda geri dönüldü. Gerçek işletim sistemi tercihini değiştiren test yapılmadı.
6. Seans CTA’sı → iletişim → “Seans akışına dön” ile önceki görünüm ve #session adresi geri geldi.
7. Laboratuvar: 5/5 kg, 35 cm → 0 N·m. 5/20 kg, 60 cm → 88,3 N·m. 5/20 kg, 10 cm → 14,7 N·m. Reset → 5/5 kg ve 35 cm.
8. Ana site 320/390/768/1024/1200/1440 px: yatay taşma yok. Eğitim ve laboratuvar 320/390/768/1440 px: sayfa taşması yok. Eğitim tablosu dar ekranda kendi alanında kayıyor.
9. Eğitim sayfasından bilgi talebi, ana iletişimde eğitim seçimini doğru hazırladı; mesaj gönderilmedi, telefon aranmadı.
10. Dört JavaScript dosyasının node --check kontrolü geçti. Üç HTML sayfasında 75 yerel referans/bağlantı kontrolü; eksik hedef/varlık ve yinelenen ID yok. Ayrıntı static-results.json içindedir.
11. Son tarayıcı uyarı/hata listesi boş. Masaüstü ve mobil ekran görüntüleri bu klasörde incelenerek kaydedildi.

## Tamamlanamayan / doğrulanmayan kısımlar

- Gerçek uygulayıcı videosu verilmedi. Bu nedenle 3D + gerçek video + açıklamadan oluşan Tri-View senkronizasyonu tamamlanmış gösterilmiyor. Sahte video veya uygulama görüntüsü üretilmedi. VIDEO-SENKRON-BRIFI.md gerekli medya ve eşleme planını içerir.
- normalizeScroll(true) genel olarak etkinleştirilmedi: resmî belge bu ayarın kaydırmayı JavaScript iş parçacığına taşıdığını açıklar. Bu projede iOS/Safari sorunu ölçülmeden yerel davranışı değiştirmek uygun bir performans kanıtı değildir.
- Gerçek Android/iPhone ve Safari, GPU frame-time, LCP/INP/CLS, tam ekran okuyucu ve %200–400 zoom testleri yapılmadı. 10/10 veya WCAG tam uygunluk sonucu verilemez.
- Yer, süre, ücret, eğitim takvimi ve onaylı ek belgeler hâlâ temsilcinin doğrulanmış bilgisine bağlıdır.

## Teknik kaynaklar

- Three.js BufferGeometryUtils: https://threejs.org/docs/#examples/en/utils/BufferGeometryUtils
- GSAP normalizeScroll: https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll()/
- Model kaynak ve lisansı: models/LICENSE-ATTRIBUTION.md
