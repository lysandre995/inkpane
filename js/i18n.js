/* Inkpane — UI strings. Italian is the default; English and German follow the same keys.
   Keys ending in "Html" or used with data-i18n-html may contain <b>…</b> only (static, trusted). */
(() => {
  const STRINGS = {
    it: {
      locale: "it-IT",
      tagline: "Il file resta nel tuo browser: niente viene caricato altrove.",
      language: "Lingua",
      install: "Installa",
      openPdf: "Apri PDF",
      savePdf: "Scarica PDF firmato",
      yourSignature: "La tua firma",
      tabDraw: "Disegna",
      tabImg: "Da immagine",
      inkBlue: "Inchiostro blu",
      inkBlack: "Inchiostro nero",
      stroke: "Tratto",
      clear: "Cancella",
      useSignature: "Usa questa firma",
      imgDrop: "Scegli una foto o scansione della firma",
      rmWhite: "Rendi trasparente lo sfondo bianco",
      curSigAlt: "Firma attuale",
      placeOnPage: "Metti sulla pagina",
      forgetSig: "Dimentica firma",
      remember: "Ricorda la firma su questo browser",
      rememberNote: "La firma resta salvata solo in questo browser, mai inviata altrove. Disattiva se il computer è condiviso.",
      rememberNoteShared: "Attenzione: questo indirizzo ({host}) è condiviso con gli altri siti GitHub Pages dello stesso account, che potrebbero leggere la firma salvata.",
      text: "Testo",
      textAria: "Testo da aggiungere",
      size: "Corpo",
      howTo: "Come si usa",
      step1: "Da Excel: <b>File → Esporta → PDF</b>, poi apri qui il PDF.",
      step2: "Disegna la firma (una volta: viene ricordata).",
      step3: "Premi <b>Metti sulla pagina</b> e clicca dove va.",
      step4: "Trascina per spostarla, il pallino per ridimensionarla, <b>Canc</b> per toglierla.",
      step5: "Scarica il PDF firmato.",
      noteGraphic: "Firma grafica (immagine sul documento), come quella di Acrobat “Compila e firma”. Non è una firma digitale con certificato.",
      banner: "Questo è un <b>documento di esempio</b> per provare. Apri il tuo PDF con <b>Apri PDF</b> o trascinalo qui.",
      dropHere: "Rilascia qui il PDF",
      pageNum: "Pag. {i} / {n}",
      remove: "Togli",
      hintSig: "Clicca sulla pagina dove va la firma",
      hintTxt: "Clicca sulla pagina dove va il testo",
      escCancel: "Esc per annullare",
      pwdProtected: "Il PDF è protetto da password: non posso aprirlo.",
      unreadable: "Non riesco a leggere questo PDF.",
      rotated: "Attenzione: alcune pagine sono ruotate, la posizione della firma potrebbe non corrispondere.",
      openFirst: "Apri prima un PDF.",
      saved: "PDF firmato salvato.",
      saveCancelled: "Salvataggio annullato.",
      ready: "PDF firmato pronto.",
      badChars: "Il testo contiene caratteri non supportati.",
      exportError: "Errore nel creare il PDF firmato.",
      officeFile: "È un file Office: esportalo prima in PDF (File → Esporta → PDF), poi aprilo qui.",
      notPdf: "Apri un file PDF.",
      sigReady: "Firma pronta: premi “Metti sulla pagina”.",
      noSigInImage: "Non trovo la firma nell'immagine.",
      imgUnreadable: "Immagine non leggibile.",
      sigForgotten: "Firma dimenticata.",
      writeFirst: "Scrivi prima il testo.",
      updated: "Inkpane è stato aggiornato: ricarica la pagina per usare la nuova versione.",
      offlineReady: "Inkpane ora funziona anche offline.",
      signedSuffix: " - firmato",
      sampleBase: "esempio",
      defaultBase: "documento",
      sTitle: "Timesheet - {month}",
      sExample: "ESEMPIO - documento di prova, non contiene dati reali",
      sDay: "Giorno", sActivity: "Attività", sHours: "Ore", sTotal: "Totale ore",
      sActs: ["Sviluppo applicazione", "Riunione di progetto", "Test in campo", "Documentazione", "Supporto impianto"],
      sDate: "Data", sSignature: "Firma del dipendente",
    },
    en: {
      locale: "en-GB",
      tagline: "Your file stays in your browser: nothing is uploaded anywhere.",
      language: "Language",
      install: "Install",
      openPdf: "Open PDF",
      savePdf: "Download signed PDF",
      yourSignature: "Your signature",
      tabDraw: "Draw",
      tabImg: "From image",
      inkBlue: "Blue ink",
      inkBlack: "Black ink",
      stroke: "Stroke",
      clear: "Clear",
      useSignature: "Use this signature",
      imgDrop: "Choose a photo or scan of your signature",
      rmWhite: "Make the white background transparent",
      curSigAlt: "Current signature",
      placeOnPage: "Place on page",
      forgetSig: "Forget signature",
      remember: "Remember the signature in this browser",
      rememberNote: "The signature is stored only in this browser and never sent anywhere. Turn it off on a shared computer.",
      rememberNoteShared: "Note: this address ({host}) is shared with the other GitHub Pages sites of the same account, which could read the stored signature.",
      text: "Text",
      textAria: "Text to add",
      size: "Size",
      howTo: "How to use it",
      step1: "In Excel: <b>File → Export → PDF</b>, then open the PDF here.",
      step2: "Draw your signature (once: it is remembered).",
      step3: "Press <b>Place on page</b> and click where it goes.",
      step4: "Drag to move it, use the dot to resize it, <b>Del</b> to remove it.",
      step5: "Download the signed PDF.",
      noteGraphic: "Graphic signature (an image on the document), like Acrobat “Fill & Sign”. It is not a certificate-based digital signature.",
      banner: "This is a <b>sample document</b> to try things out. Open your PDF with <b>Open PDF</b> or drop it here.",
      dropHere: "Drop the PDF here",
      pageNum: "Page {i} / {n}",
      remove: "Remove",
      hintSig: "Click on the page where the signature goes",
      hintTxt: "Click on the page where the text goes",
      escCancel: "Esc to cancel",
      pwdProtected: "This PDF is password-protected: it can't be opened.",
      unreadable: "This PDF can't be read.",
      rotated: "Note: some pages are rotated, the signature position may not match.",
      openFirst: "Open a PDF first.",
      saved: "Signed PDF saved.",
      saveCancelled: "Save cancelled.",
      ready: "Signed PDF ready.",
      badChars: "The text contains unsupported characters.",
      exportError: "Could not create the signed PDF.",
      officeFile: "This is an Office file: export it to PDF first (File → Export → PDF), then open it here.",
      notPdf: "Open a PDF file.",
      sigReady: "Signature ready: press “Place on page”.",
      noSigInImage: "No signature found in the image.",
      imgUnreadable: "The image can't be read.",
      sigForgotten: "Signature forgotten.",
      writeFirst: "Type the text first.",
      updated: "Inkpane has been updated: reload the page to use the new version.",
      offlineReady: "Inkpane now works offline too.",
      signedSuffix: " - signed",
      sampleBase: "sample",
      defaultBase: "document",
      sTitle: "Timesheet - {month}",
      sExample: "SAMPLE - test document, contains no real data",
      sDay: "Day", sActivity: "Activity", sHours: "Hours", sTotal: "Total hours",
      sActs: ["Application development", "Project meeting", "Field test", "Documentation", "Plant support"],
      sDate: "Date", sSignature: "Employee signature",
    },
    de: {
      locale: "de-DE",
      tagline: "Die Datei bleibt in deinem Browser: nichts wird hochgeladen.",
      language: "Sprache",
      install: "Installieren",
      openPdf: "PDF öffnen",
      savePdf: "Unterschriebenes PDF laden",
      yourSignature: "Deine Unterschrift",
      tabDraw: "Zeichnen",
      tabImg: "Aus Bild",
      inkBlue: "Blaue Tinte",
      inkBlack: "Schwarze Tinte",
      stroke: "Strich",
      clear: "Löschen",
      useSignature: "Diese Unterschrift verwenden",
      imgDrop: "Foto oder Scan der Unterschrift wählen",
      rmWhite: "Weißen Hintergrund transparent machen",
      curSigAlt: "Aktuelle Unterschrift",
      placeOnPage: "Auf Seite setzen",
      forgetSig: "Unterschrift vergessen",
      remember: "Unterschrift in diesem Browser merken",
      rememberNote: "Die Unterschrift wird nur in diesem Browser gespeichert und nirgendwohin gesendet. Auf einem gemeinsam genutzten Computer ausschalten.",
      rememberNoteShared: "Achtung: Diese Adresse ({host}) wird mit den anderen GitHub-Pages-Seiten desselben Kontos geteilt, die die gespeicherte Unterschrift lesen könnten.",
      text: "Text",
      textAria: "Hinzuzufügender Text",
      size: "Größe",
      howTo: "So geht's",
      step1: "In Excel: <b>Datei → Exportieren → PDF</b>, dann das PDF hier öffnen.",
      step2: "Unterschrift zeichnen (einmalig: sie wird gemerkt).",
      step3: "<b>Auf Seite setzen</b> drücken und an die Stelle klicken.",
      step4: "Ziehen zum Verschieben, Punkt zum Skalieren, <b>Entf</b> zum Entfernen.",
      step5: "Unterschriebenes PDF herunterladen.",
      noteGraphic: "Grafische Unterschrift (ein Bild im Dokument), wie bei Acrobat „Ausfüllen und unterschreiben“. Keine zertifikatsbasierte digitale Signatur.",
      banner: "Dies ist ein <b>Beispieldokument</b> zum Ausprobieren. Öffne dein PDF mit <b>PDF öffnen</b> oder zieh es hierher.",
      dropHere: "PDF hier ablegen",
      pageNum: "Seite {i} / {n}",
      remove: "Entfernen",
      hintSig: "Auf die Stelle klicken, wo die Unterschrift hin soll",
      hintTxt: "Auf die Stelle klicken, wo der Text hin soll",
      escCancel: "Esc zum Abbrechen",
      pwdProtected: "Das PDF ist passwortgeschützt und kann nicht geöffnet werden.",
      unreadable: "Dieses PDF kann nicht gelesen werden.",
      rotated: "Achtung: Einige Seiten sind gedreht, die Position der Unterschrift könnte abweichen.",
      openFirst: "Zuerst ein PDF öffnen.",
      saved: "Unterschriebenes PDF gespeichert.",
      saveCancelled: "Speichern abgebrochen.",
      ready: "Unterschriebenes PDF bereit.",
      badChars: "Der Text enthält nicht unterstützte Zeichen.",
      exportError: "Fehler beim Erstellen des unterschriebenen PDF.",
      officeFile: "Das ist eine Office-Datei: zuerst als PDF exportieren (Datei → Exportieren → PDF), dann hier öffnen.",
      notPdf: "Bitte eine PDF-Datei öffnen.",
      sigReady: "Unterschrift bereit: „Auf Seite setzen“ drücken.",
      noSigInImage: "Keine Unterschrift im Bild gefunden.",
      imgUnreadable: "Bild kann nicht gelesen werden.",
      sigForgotten: "Unterschrift vergessen.",
      writeFirst: "Zuerst den Text eingeben.",
      updated: "Inkpane wurde aktualisiert: Seite neu laden, um die neue Version zu verwenden.",
      offlineReady: "Inkpane funktioniert jetzt auch offline.",
      signedSuffix: " - unterschrieben",
      sampleBase: "beispiel",
      defaultBase: "dokument",
      sTitle: "Stundenzettel - {month}",
      sExample: "BEISPIEL - Testdokument, enthält keine echten Daten",
      sDay: "Tag", sActivity: "Tätigkeit", sHours: "Std.", sTotal: "Stunden gesamt",
      sActs: ["Anwendungsentwicklung", "Projektbesprechung", "Feldtest", "Dokumentation", "Anlagensupport"],
      sDate: "Datum", sSignature: "Unterschrift Mitarbeiter",
    },
  };

  const LANGS = Object.keys(STRINGS);
  const LS_LANG = "inkpane.lang";
  let current = "it";

  function detect() {
    let saved = null;
    try { saved = localStorage.getItem(LS_LANG); } catch {}
    if (saved && STRINGS[saved]) return saved;
    for (const l of navigator.languages || [navigator.language || ""]) {
      const base = String(l).toLowerCase().split("-")[0];
      if (STRINGS[base]) return base;
    }
    return "it";
  }

  function t(key, vars) {
    let s = STRINGS[current][key] ?? STRINGS.it[key] ?? key;
    if (vars && typeof s === "string") s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
    return s;
  }

  function apply(root = document) {
    document.documentElement.lang = current;
    root.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll("[data-i18n-attr]").forEach(el => {
      for (const pair of el.dataset.i18nAttr.split(";")) {
        const [attr, key] = pair.split(":");
        if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
      }
    });
  }

  function set(lang, persist) {
    if (!STRINGS[lang]) lang = "it";
    current = lang;
    if (persist) { try { localStorage.setItem(LS_LANG, lang); } catch {} }
    apply();
  }

  current = detect();
  window.I18N = { t, set, apply, langs: LANGS, get lang() { return current; }, get locale() { return STRINGS[current].locale; } };
})();
