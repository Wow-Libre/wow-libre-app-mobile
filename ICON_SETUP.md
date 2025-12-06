# Guía para Configurar el Icono de la Aplicación

## Requisitos

Necesitas un icono principal de **1024x1024 píxeles** en formato PNG (sin transparencia para iOS, con o sin transparencia para Android).

## Opción 1: Herramienta Automática (Recomendada) ✅

La herramienta `@bam.tech/react-native-make` ya está instalada en el proyecto.

### Pasos rápidos:

1. **Prepara tu icono**: Crea un icono de **1024x1024 píxeles** en formato PNG
   - **iOS**: Sin transparencia (fondo sólido)
   - **Android**: Puede tener transparencia

2. **Coloca el icono**: Guarda el archivo como `assets/icon.png`

3. **Genera los iconos automáticamente**:
   ```bash
   npm run set-icon
   ```
   
   O manualmente:
   ```bash
   npx react-native set-icon --path ./assets/icon.png --platform all
   ```

4. **Reconstruye la app**:
   ```bash
   # Para iOS
   npm run ios
   
   # Para Android
   npm run android
   ```

## Opción 2: Manual

### Para iOS

1. Prepara un icono de **1024x1024 píxeles** (PNG, sin transparencia)
2. Coloca el archivo en: `ios/wowlibre/Images.xcassets/AppIcon.appiconset/`
3. Nombra el archivo como `icon-1024.png`
4. Actualiza `Contents.json` con las referencias a las imágenes

**Tamaños necesarios para iOS:**
- 20x20 @2x (40x40px)
- 20x20 @3x (60x60px)
- 29x29 @2x (58x58px)
- 29x29 @3x (87x87px)
- 40x40 @2x (80x80px)
- 40x40 @3x (120x120px)
- 60x60 @2x (120x120px)
- 60x60 @3x (180x180px)
- 1024x1024 (App Store)

### Para Android

1. Prepara iconos en los siguientes tamaños:
   - **mdpi**: 48x48px
   - **hdpi**: 72x72px
   - **xhdpi**: 96x96px
   - **xxhdpi**: 144x144px
   - **xxxhdpi**: 192x192px

2. Reemplaza los archivos en:
   - `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
   - `android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png`
   - `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
   - `android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png`
   - `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
   - `android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png`
   - `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
   - `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png`
   - `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
   - `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png`

## Herramientas Online para Generar Iconos

1. **AppIcon.co**: https://appicon.co
   - Sube tu icono de 1024x1024
   - Genera todos los tamaños para iOS y Android
   - Descarga el paquete completo

2. **IconKitchen**: https://icon.kitchen
   - Similar a AppIcon.co
   - Genera iconos para múltiples plataformas

3. **MakeAppIcon**: https://makeappicon.com
   - Genera todos los tamaños necesarios

## Después de Agregar los Iconos

### iOS
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

### Android
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## Notas

- **iOS**: El icono NO debe tener transparencia (alpha channel)
- **Android**: Puede tener transparencia
- **Formato**: PNG es el formato recomendado
- **Fondo**: Para iOS, asegúrate de que el icono tenga un fondo sólido

