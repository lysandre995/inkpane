# Inkpane

Sign PDFs in your browser. Nothing is uploaded.

**Open it: <https://sign.alessandroalfano.com>**

## Features

- Draw your signature, or load a photo or scan of it (the white background turns transparent).
- Add the date or any short text next to it.
- Click to place, drag to move, use the dot to resize, **Del** to remove.
- Download the signed PDF.
- Installable app (PWA): works offline, and on Windows it opens PDFs from Explorer (**Open with → Inkpane**).
- Italian, English and German.

> **Graphic signature, not a digital signature.** Inkpane stamps an image of your handwritten signature on the page. It adds no certificate-based (PAdES) signature and gives no cryptographic proof of who signed.

## Privacy

The PDF and the signature never leave your device. The signature is remembered in your browser's local storage; turn off **Remember the signature in this browser** to keep nothing.

## Run locally

From this folder, start any static HTTP server, then open <http://localhost:8080/> (service workers do not run from `file://`):

```bash
python -m http.server 8080
```

## Releasing

1. Bump `CACHE_VERSION` in `sw.js` and `VERSION` in `js/app.js` to the same value.
2. Commit and push to `main`: GitHub Pages publishes it within a minute.
3. Installed copies download the update in the background and use it from the next reload.

## Limitations

Password-protected PDFs cannot be opened. Text uses Helvetica, so Latin characters only.

## Credits and license

Bundled in `vendor/`, each with its own licence:

- [pdf.js](https://github.com/mozilla/pdf.js) 3.11.174, Apache-2.0
- [pdf-lib](https://github.com/Hopding/pdf-lib) 1.17.1, MIT
- Bricolage Grotesque, IBM Plex Sans and IBM Plex Mono, SIL OFL 1.1

Inkpane itself is released under the [MIT License](LICENSE).
