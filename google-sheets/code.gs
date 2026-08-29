function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Feuille 1');
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    '',                          // A: Statut (left empty)
    data.nomComplet || '',       // B: Nom Complet
    data.num || '',              // C: num
    data.article || '',          // D: Article
    data.quantite || '',         // E: Quantité
    data.adresse || '',          // F: Adresse
    data.wilaya || '',           // G: Nom ou Code Wilaya
    data.commune || '',          // H: Commune
    data.totalARamasser || '',   // I: Total à ramasser
    data.idExterne || '',        // J: ID Externe
    'NON',                       // K: OUI pour Echange (always NON)
    data.stopdesk || '',         // L: Si Stopdesk mettez le Nom du stopdesk
    data.refArticle || '',       // M: Ref Article
    '',                          // N: Note
    data.date || ''              // O: la date
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
