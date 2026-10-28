# Yumeiho Experience V7

V6 uzerine hata duzeltme surumu.

- Hizli scroll'da eski kamera animasyonu iptal edilir. OrbitControls ile manuel etkilesim, sifirlama ve model yukleme de animasyonu iptal eder.
- Hikaye kamerasinda ani sicrama yerine zaman tabanli yumuşak hedef takibi.
- Model degisiminde eski geometry ve material kaynaklari temizlenir.
- Tek dosyalik GLB kabul edilir; .gltf dosyasinin baska kaynaklara bagimli olmasi onlenir.
- GLB boyut siniri 120 MB; secilen dosya URL'si islem sonunda geri birakilir.
- Gercek Écorché modeli pakette yoktur. CDN ag erisimi veya models/ altina model eklenmesi gerekir.
- 3D varligin anatomik dogrulugu ve CDN yuklemesi bu ortamda dogrulanamadi.

## Yerel calistirma

`python -m http.server 3000` sonra http://localhost:3000

Not: Three.js ve GSAP CDN'leri icin internet gerekir. Bu surum yayin hazir degildir; gercek model, gorsel testler, foto/videolar ve iletisim bilgileri eksiktir.


## 28 Ekim 2026 — UI/UX ve teknik doğrulama
- Menüdeki görsele gömülü eski metinler CSS maskesiyle gizlendi; özgün görsel korundu.
- Sağ panel 6 gerçek bölüm bağlantısı oldu. Kompakt menü 1100 px altında açılır.
- Hero opaklığı / GSAP etkileşimi, menü odağı, Escape, skip link ve aktif durumlar düzeltildi.
- Three.js dinamik ve gecikmeli yüklenir. Hikâye ile laboratuvar bağımsızdır; gerçek model kadrajı sınır kutusuna göre hesaplanır.
- Durağan model render döngüsü durur. Yerel karşılaştırmada 38.040 → 0 WebGL çizim çağrısı/sn görüldü (FPS ölçümü değildir).
- 320, 390, 768, 1024, 1280, 1440, 1920 px düzenleri; 634 parçalı model, klavye ve bağımlılık hata fallback akışı test edildi.
- Yerel başlatma: `python -m http.server 3001 --bind 127.0.0.1`
- Gerçek iletişim adresi, uzman materyalleri, yerel GLB ve gerçek cihaz / ekran okuyucu testleri yayın öncesinde tamamlanmalıdır.


## Bedenin Mimarisi kartı
- Metinsiz temiz pelvis görseli ve kesilmeyen contain kadrajı.
- Başlık görselden ayrıldı; kart erişilebilir anatomi bağlantısına dönüştürüldü.
- Masaüstü ve mobil görüntüler, Enter/tıklama ve dahili bağlantılar doğrulandı.
