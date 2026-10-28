# YUMEIHO — Anatomy Experience V4

## Başlatma

`python -m http.server 3000` → http://localhost:3000

## Gerçek anatomi modeli

Site açılırken Écorché adlı 634 parçalı gerçek kas/iskelet modelini jsDelivr üzerinden yüklemeyi dener. Model dosyası ZIP içine **dahil değildir**; ilk yükleme için internet gerekir.

Çevrimdışı / yerel barındırma: CC BY-SA 4.0 lisanslı `ecorche.glb` dosyasını https://github.com/Charleeh/ecorche adresinden indirip `models/ecorche.glb` olarak yerleştirin. Uygulama önce yerel dosyaya bakar.

Model özellikleri: iskelet, yüzeysel ve derin kaslar; mesh adı ve userData.layer üzerinden otomatik sınıflandırma. Pelvis, iskeletin ayrı bir filtresidir.

Önemli: Bu model tıbbi cihaz değildir ve eğitim/görselleştirme içindir. Tek yetişkin erkek anatomisi, yalnızca kemik/kas sistemi. Klinisyen onayı olmadan tanısal ifadeler kullanılmamalıdır.

## Lisans (zorunlu atıf)

Écorché (https://github.com/Charleeh/ecorche), CC BY-SA 4.0. Based on BodyParts3D, © The Database Center for Life Science, CC BY 4.0, and Z-Anatomy by Gauthier Kervyn, CC BY-SA 4.0. Model değişiklikleri aynı lisansla paylaşılmalıdır. Kod ve diğer site görselleri ayrı varlıklardır.

## Kontrol

3D model döndürme, zoom, otomatik döndürme, katman görünürlüğü, omurga/kas/pelvis vurgusu, kullanıcı GLB yükleme. Three.js ve GSAP CDN bağlantısı gerektirir. Bu ortamda tarayıcı ve internet üzerinden nihai yükleme testi yapılamamıştır.


## V5 — Sinematik anatomi hikâyesi
- Anatomy Lab altında dört sahnelik scroll storytelling, sticky görsel ve ilerleme çubuğu.
- Scroll bölümleri 3D kameranın odağını ve anatomik katman görünürlüğünü değiştirir.
- Fare/dokunma ile manuel 3D kontrol korunur; hareket azaltma desteği mevcut.
- Gerçek GLB hâlâ çevrimiçi kaynağa bağlıdır; ZIP içinde yer almaz.
- Bütün anatomik görseller eğitim amaçlıdır, klinik doğruluk iddiası taşımaz.


## V6 — Gerçek 3D hikâye paneli ve Meshopt
- Sinematik hikâye panelinde statik görsel yerine ikinci gerçek WebGL renderı bulunur; aynı anatomik sahneyi paylaşır. Bölümler kamera konumunu ve aktif katmanları değiştirir.
- Varsayılan kaynak `model/ecorche.meshopt.glb` (yaklaşık 5,7 MB); GLTFLoader ve MeshoptDecoder kullanır. Dosya ZIP içinde **yoktur**.
- Yerel kurulumda `models/ecorche.meshopt.glb` veya `models/ecorche.glb` önceliklidir. Otomatik yüklemenin çalışması için ağ erişimi ve kaynak CORS desteği gerekir.
- Model ve WebGL'in gerçek tarayıcıda çalıştığı doğrulanmadı; görsel ve temsili model fallback olarak kalır.
- Gerçek tedavi videosu, uzman fotoğrafı ve iletişim bilgileri henüz yoktur.


## 28 Ekim 2026 — UI/UX ve teknik doğrulama
- Menüdeki görsele gömülü eski metinler CSS maskesiyle gizlendi; özgün görsel korundu.
- Sağ panel 6 gerçek bölüm bağlantısı oldu. Kompakt menü 1100 px altında açılır.
- Hero opaklığı / GSAP etkileşimi, menü odağı, Escape, skip link ve aktif durumlar düzeltildi.
- Three.js dinamik ve gecikmeli yüklenir. Hikâye ile laboratuvar bağımsızdır; gerçek model kadrajı sınır kutusuna göre hesaplanır.
- Durağan model render döngüsü durur. Yerel karşılaştırmada 38.040 → 0 WebGL çizim çağrısı/sn görüldü (FPS ölçümü değildir).
- 320, 390, 768, 1024, 1280, 1440, 1920 px düzenleri; 634 parçalı model, klavye ve bağımlılık hata fallback akışı test edildi.
- Yerel başlatma: `python -m http.server 3001 --bind 127.0.0.1`
- Gerçek iletişim adresi, uzman materyalleri, yerel GLB ve gerçek cihaz / ekran okuyucu testleri yayın öncesinde tamamlanmalıdır.
