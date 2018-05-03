
(function () {
    "use strict";

    var messageBanner;

    // Die Initialisierungsfunktion muss bei jedem Laden einer neuen Seite ausgeführt werden.
    Office.initialize = function (reason) {
        $(document).ready(function () {
            // Initialisiert den FabricUI-Benachrichtigungsmechanismus und blendet ihn aus.
            var element = document.querySelector('.ms-MessageBanner');
            messageBanner = new fabric.MessageBanner(element);
            messageBanner.hideBanner();

            // Wenn nicht Word 2016 verwendet wird, Fallbacklogik verwenden.
            if (!Office.context.requirements.isSetSupported('WordApi', '1.1')) {
                $("#template-description").text("Dieses Beispiel zeigt den ausgewählten Text an.");
                $('#button-text').text("Anzeigen");
                $('#button-desc').text("Zeigt den ausgewählten Text an.");
                
                $('#highlight-button').click(displaySelectedText);
                return;
            }

            $("#template-description").text("Dieses Beispiel hebt das längste Wort im Text hervor, den Sie im Dokument ausgewählt haben.");
            $('#button-text').text("Hervorheben");
            $('#button-desc').text("Hebt das längste Wort hervor.");
            
            loadSampleData();

            // Fügt einen Klickereignishandler für die Hervorhebungsschaltfläche hinzu.
            $('#highlight-button').click(hightlightLongestWord);
        });
    };

    function loadSampleData() {
        // Führt einen Batchvorgang für das Word-Objektmodell aus.
        Word.run(function (context) {
            // Erstellt ein Proxyobjekt für den Dokumenttext.
            var body = context.document.body;

            // Reiht einen Befehl zum Löschen des Inhalts des Texts in die Warteschlange ein.
            body.clear();
            // Reiht einen Befehl zum Einfügen von Text am Ende des Word-Dokumenttexts in die Warteschlange ein.
            body.insertText(
                "This is a sample text inserted in the document",
                Word.InsertLocation.end);

            // Synchronisiert den Dokumentzustand durch Ausführen von in die Warteschlange eingereihten Befehlen und gibt eine Zusage zum Anzeigen des Abschlusses der Aufgabe zurück.
            return context.sync();
        })
        .catch(errorHandler);
    }

    function hightlightLongestWord() {
        Word.run(function (context) {
            // Reiht einen Befehl zum Abrufen der aktuellen Auswahl in die Warteschlange ein und
            // erstellt dann ein Proxybereichsobjekt mit den Ergebnissen.
            var range = context.document.getSelection();
            
            // Diese Variable enthält die Suchergebnisse für das längste Wort.
            var searchResults;
            
            // Reiht einen Befehl in die Warteschlange ein, um das Bereichsauswahlergebnis zu laden.
            context.load(range, 'text');

            // Synchronisiert den Zustand des Dokuments durch Ausführen der in die Warteschlange eingereihten Befehle
            // und gibt eine Zusage zum Angeben des Abschlusses der Aufgabe zurück.
            return context.sync()
                .then(function () {
                    // Ruft das längste Wort aus der Auswahl ab.
                    var words = range.text.split(/\s+/);
                    var longestWord = words.reduce(function (word1, word2) { return word1.length > word2.length ? word1 : word2; });

                    // Reiht einen Suchbefehl in die Warteschlange ein.
                    searchResults = range.search(longestWord, { matchCase: true, matchWholeWord: true });

                    // Reiht einen Befehl zum Laden der Eigenschaft "font" der Ergebnisse in die Warteschlange ein.
                    context.load(searchResults, 'font');
                })
                .then(context.sync)
                .then(function () {
                    // Reiht einen Befehl zum Hervorheben der Suchergebnisse in die Warteschlange ein.
                    searchResults.items[0].font.highlightColor = '#FFFF00'; // Gelb
                    searchResults.items[0].font.bold = true;
                })
                .then(context.sync);
        })
        .catch(errorHandler);
    } 


    function displaySelectedText() {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.Text,
            function (result) {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    showNotification('Der ausgewählte Text lautet:', '"' + result.value + '"');
                } else {
                    showNotification('Fehler:', result.error.message);
                }
            });
    }

    //$$(Helper function for treating errors, $loc_script_taskpane_home_js_comment34$)$$
    function errorHandler(error) {
        // $$(Always be sure to catch any accumulated errors that bubble up from the Word.run execution., $loc_script_taskpane_home_js_comment35$)$$
        showNotification("Fehler:", error);
        console.log("Error: " + error);
        if (error instanceof OfficeExtension.Error) {
            console.log("Debug info: " + JSON.stringify(error.debugInfo));
        }
    }

    // Eine Hilfsfunktion zum Anzeigen von Benachrichtigungen.
    function showNotification(header, content) {
        $("#notification-header").text(header);
        $("#notification-body").text(content);
        messageBanner.showBanner();
        messageBanner.toggleExpansion();
    }
})();
