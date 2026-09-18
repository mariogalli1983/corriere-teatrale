document.addEventListener("DOMContentLoaded", () => {
    /* =========================================================
       MENU MOBILE
       ========================================================= */

    const menuPrincipale =
        document.querySelector(".main-nav");

    const pulsanteMenu =
        document.querySelector(".menu-toggle");

    if (menuPrincipale && pulsanteMenu) {

        pulsanteMenu.addEventListener("click", () => {

            const aperto =
                menuPrincipale.classList.toggle("menu-open");

            pulsanteMenu.setAttribute(
                "aria-expanded",
                aperto ? "true" : "false"
            );

            pulsanteMenu.setAttribute(
                "aria-label",
                aperto ? "Chiudi menu" : "Apri menu"
            );

        });

    }

    const elencoCompagnie =
        document.getElementById("elenco-compagnie");

    const elencoEventi =
        document.getElementById("elenco-eventi");

    const schedaCompagnia =
        document.getElementById("scheda-compagnia");

    const schedaEvento =
        document.getElementById("scheda-evento");

    const elencoAnnunci =
        document.getElementById("elenco-annunci");

    const homeEventi =
        document.getElementById("home-eventi");

    const homeNotizie =
        document.getElementById("home-notizie");

    const homeBacheca =
        document.getElementById("home-bacheca");

    if (elencoCompagnie) {
        caricaCompagnie();
    }

    if (elencoEventi) {
        caricaEventi();
    }

    if (schedaCompagnia) {
        caricaSchedaCompagnia();
    }

    if (schedaEvento) {
        caricaSchedaEvento();
    }

    if (homeEventi) {
        caricaEventiHome();
    }

    if (homeNotizie) {
        caricaNotizieHome();
    }

    if (homeBacheca) {
        caricaBachecaHome();
    }

    if (elencoAnnunci) {
        caricaAnnunci();
    }

});


/* =========================================================
   FUNZIONI UTILI
   ========================================================= */

function formattaData(dataISO, opzioni = {}) {

    if (!dataISO) {
        return "";
    }

    const data =
        new Date(dataISO + "T12:00:00");

    return data.toLocaleDateString(
        "it-IT",
        opzioni
    );
}


function annuncioScaduto(dataScadenza) {

    if (!dataScadenza) {
        return false;
    }

    /*
       La scadenza resta valida per tutta la giornata indicata.
       L'annuncio scompare dalla mezzanotte successiva.
    */

    const fineScadenza =
        new Date(dataScadenza + "T23:59:59");

    const adesso =
        new Date();

    return adesso > fineScadenza;
}


/* =========================================================
   GESTIONE COMPAGNIE SPECIALI
   ========================================================= */

function datiCompagniaEvento(evento, compagnie) {

    /*
       I FATTI IN CASA APS è l'editore di Corriere Teatrale
       e quindi non compare nella directory pubblica delle
       compagnie.

       Gli spettacoli possono però continuare ad avere:
       compagnia_id: "i-fatti-in-casa"
    */

    if (evento.compagnia_id === "i-fatti-in-casa") {

        return {
            nome: "I FATTI IN CASA APS",
            url: "i-fatti-in-casa.html",
            speciale: true
        };

    }

    const compagnia =
        compagnie.find(
            c => c.id === evento.compagnia_id
        );

    if (compagnia) {

        return {
            nome: compagnia.nome,
            url: `compagnia.html?id=${compagnia.id}`,
            speciale: false
        };

    }

    return {
        nome: "Compagnia teatrale",
        url: "",
        speciale: false
    };

}


/* =========================================================
   DIRECTORY COMPAGNIE
   ========================================================= */

async function caricaCompagnie() {

    const contenitore =
        document.getElementById("elenco-compagnie");

    try {

        const risposta =
            await fetch("data/compagnie.json");

        if (!risposta.ok) {
            throw new Error(
                "Impossibile caricare le compagnie"
            );
        }

        const compagnie =
            await risposta.json();

        const compagnieAttive =
            compagnie.filter(
                compagnia =>
                    compagnia.attiva === true
            );

        if (compagnieAttive.length === 0) {

            contenitore.innerHTML =
                "<p>Non ci sono ancora compagnie pubblicate.</p>";

            return;
        }

        contenitore.innerHTML =
            compagnieAttive.map(compagnia => {

                const generi =
                    compagnia.generi
                        ? compagnia.generi.join(" · ")
                        : "";

                return `

                    <article class="company-card">

                        ${compagnia.logo ? `

                            <a href="compagnia.html?id=${compagnia.id}">

                                <img
                                    src="${compagnia.logo}"
                                    alt="Logo ${compagnia.nome}"
                                    class="company-logo"
                                >

                            </a>

                        ` : ""}

                        <div class="categoria">
                            ${compagnia.tipologia}
                        </div>

                        <h3>

                            <a href="compagnia.html?id=${compagnia.id}">
                                ${compagnia.nome}
                            </a>

                        </h3>

                        <p>

                            ${compagnia.citta}

                            ${compagnia.zona
                                ? " · " + compagnia.zona
                                : ""}

                            ${compagnia.municipio
                                ? " · Municipio " + compagnia.municipio
                                : ""}

                        </p>

                        <p>
                            ${compagnia.descrizione}
                        </p>

                        ${generi ? `

                            <p>
                                <strong>${generi}</strong>
                            </p>

                        ` : ""}

                    </article>

                `;

            }).join("");

    } catch (errore) {

        console.error(errore);

        contenitore.innerHTML =
            "<p>Si è verificato un problema nel caricamento delle compagnie.</p>";

    }

}


/* =========================================================
   ELENCO EVENTI / SPETTACOLI
   ========================================================= */

async function caricaEventi() {

    const contenitore =
        document.getElementById("elenco-eventi");

    try {

        const [
            rispostaEventi,
            rispostaCompagnie
        ] = await Promise.all([

            fetch("data/eventi.json"),
            fetch("data/compagnie.json")

        ]);

        if (
            !rispostaEventi.ok ||
            !rispostaCompagnie.ok
        ) {

            throw new Error(
                "Impossibile caricare gli eventi"
            );

        }

        const eventi =
            await rispostaEventi.json();

        const compagnie =
            await rispostaCompagnie.json();

        const eventiPubblicati =
            eventi.filter(
                evento =>
                    evento.pubblicato === true
            );

        if (eventiPubblicati.length === 0) {

            contenitore.innerHTML =
                "<p>Non ci sono eventi in programma.</p>";

            return;
        }

        contenitore.innerHTML =
            eventiPubblicati.map(evento => {

                const datiCompagnia =
                    datiCompagniaEvento(
                        evento,
                        compagnie
                    );

                const dateHTML =
                    evento.date.map(replica => {

                        const dataFormattata =
                            formattaData(
                                replica.data,
                                {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                }
                            );

                        return `

                            <div>

                                <strong>
                                    ${dataFormattata}
                                </strong>

                                · ${replica.ora}

                            </div>

                        `;

                    }).join("");

                return `

                    <article class="event-card">

                        ${evento.locandina ? `

                            <a href="evento.html?id=${evento.id}">

                                <img
                                    src="${evento.locandina}"
                                    alt="Locandina ${evento.titolo}"
                                    class="event-poster"
                                >

                            </a>

                        ` : ""}

                        <div class="categoria">
                            ${evento.tipo}
                        </div>

                        <h3>

                            <a href="evento.html?id=${evento.id}">
                                ${evento.titolo}
                            </a>

                        </h3>

                        <p>

                            ${
                                datiCompagnia.url
                                    ? `
                                        <a href="${datiCompagnia.url}">
                                            <strong>
                                                ${datiCompagnia.nome}
                                            </strong>
                                        </a>
                                    `
                                    : `
                                        <strong>
                                            ${datiCompagnia.nome}
                                        </strong>
                                    `
                            }

                        </p>

                        <div style="margin: 12px 0;">
                            ${dateHTML}
                        </div>

                        <p>

                            ${evento.luogo}

                            ${evento.indirizzo
                                ? "<br>" + evento.indirizzo
                                : ""}

                            ${evento.quartiere
                                ? "<br>" + evento.quartiere
                                : ""}

                            ${evento.municipio
                                ? " · Municipio " + evento.municipio
                                : ""}

                        </p>

                    </article>

                `;

            }).join("");

    } catch (errore) {

        console.error(errore);

        contenitore.innerHTML =
            "<p>Si è verificato un problema nel caricamento degli eventi.</p>";

    }

}


/* =========================================================
   SCHEDA SINGOLA COMPAGNIA
   ========================================================= */

async function caricaSchedaCompagnia() {

    const contenitore =
        document.getElementById("scheda-compagnia");

    const parametri =
        new URLSearchParams(window.location.search);

    const idCompagnia =
        parametri.get("id");

    if (!idCompagnia) {

        contenitore.innerHTML =
            "<p>Compagnia non specificata.</p>";

        return;
    }

    try {

        const [
            rispostaCompagnie,
            rispostaEventi
        ] = await Promise.all([

            fetch("data/compagnie.json"),
            fetch("data/eventi.json")

        ]);

        if (
            !rispostaCompagnie.ok ||
            !rispostaEventi.ok
        ) {

            throw new Error(
                "Errore nel caricamento dei dati"
            );

        }

        const compagnie =
            await rispostaCompagnie.json();

        const eventi =
            await rispostaEventi.json();

        const compagnia =
            compagnie.find(
                c => c.id === idCompagnia
            );

        if (!compagnia) {

            contenitore.innerHTML =
                "<h2>Compagnia non trovata</h2>";

            return;
        }

        const eventiCompagnia =
            eventi.filter(
                evento =>
                    evento.compagnia_id === compagnia.id &&
                    evento.pubblicato === true
            );

        document.title =
            compagnia.nome +
            " | Corriere Teatrale";

        const generi =
            compagnia.generi
                ? compagnia.generi.join(" · ")
                : "";

        const eventiHTML =
            eventiCompagnia.length > 0

                ? eventiCompagnia.map(evento => {

                    const date =
                        evento.date.map(replica => {

                            const dataFormattata =
                                formattaData(
                                    replica.data,
                                    {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric"
                                    }
                                );

                            return `

                                <div>

                                    <strong>
                                        ${dataFormattata}
                                    </strong>

                                    · ${replica.ora}

                                </div>

                            `;

                        }).join("");

                    return `

                        <article class="event-card">

                            ${evento.locandina ? `

                                <a href="evento.html?id=${evento.id}">

                                    <img
                                        src="${evento.locandina}"
                                        alt="Locandina ${evento.titolo}"
                                        class="event-poster"
                                    >

                                </a>

                            ` : ""}

                            <div class="categoria">
                                ${evento.tipo}
                            </div>

                            <h3>

                                <a href="evento.html?id=${evento.id}">
                                    ${evento.titolo}
                                </a>

                            </h3>

                            <div style="margin: 12px 0;">
                                ${date}
                            </div>

                            <p>

                                ${evento.luogo}

                                ${evento.indirizzo
                                    ? "<br>" + evento.indirizzo
                                    : ""}

                                ${evento.quartiere
                                    ? "<br>" + evento.quartiere
                                    : ""}

                                ${evento.municipio
                                    ? " · Municipio " + evento.municipio
                                    : ""}

                            </p>

                        </article>

                    `;

                }).join("")

                : "<p>Nessun evento in programma.</p>";

        contenitore.innerHTML = `

            <section>

                <div class="company-profile">

                    ${compagnia.logo ? `

                        <div class="company-profile-logo">

                            <img
                                src="${compagnia.logo}"
                                alt="Logo ${compagnia.nome}"
                            >

                        </div>

                    ` : ""}

                    <div class="company-profile-content">

                        <div class="categoria">
                            ${compagnia.tipologia}
                        </div>

                        <h1 style="
                            font-family: Georgia, 'Times New Roman', serif;
                            font-size: clamp(36px, 5vw, 55px);
                            margin: 10px 0;
                        ">

                            ${compagnia.nome}

                        </h1>

                        <p style="
                            color: #666;
                            font-size: 17px;
                            margin-bottom: 20px;
                        ">

                            ${compagnia.citta}

                            ${compagnia.zona
                                ? " · " + compagnia.zona
                                : ""}

                            ${compagnia.municipio
                                ? " · Municipio " + compagnia.municipio
                                : ""}

                        </p>

                        <p style="
                            max-width: 750px;
                            font-size: 17px;
                        ">

                            ${compagnia.descrizione}

                        </p>

                        ${generi ? `

                            <p style="margin-top: 15px;">

                                <strong>
                                    Generi:
                                </strong>

                                ${generi}

                            </p>

                        ` : ""}

                        ${compagnia.email ? `

                            <p style="margin-top: 15px;">

                                <strong>Email:</strong>

                                <a href="mailto:${compagnia.email}">
                                    ${compagnia.email}
                                </a>

                            </p>

                        ` : ""}

                        ${compagnia.telefono ? `

                            <p>

                                <strong>Telefono:</strong>

                                ${compagnia.telefono}

                            </p>

                        ` : ""}

                        ${compagnia.sito ? `

                            <p>

                                <a
                                    href="${compagnia.sito}"
                                    target="_blank"
                                    rel="noopener"
                                >
                                    Sito ufficiale
                                </a>

                            </p>

                        ` : ""}

                    </div>

                </div>

            </section>


            <section style="margin-top: 50px;">

                <div class="section-header">

                    <h2>
                        Prossimi spettacoli
                    </h2>

                </div>

                <div class="event-grid">

                    ${eventiHTML}

                </div>

            </section>

        `;

    } catch (errore) {

        console.error(errore);

        contenitore.innerHTML =
            "<p>Si è verificato un problema nel caricamento della compagnia.</p>";

    }

}
/* =========================================================
   FORMATTAZIONE MARKDOWN SPETTACOLI
   ========================================================= */

function formattaMarkdownEvento(testo) {

    if (!testo) {
        return "";
    }

    /*
       Se marked.js è disponibile utilizziamo il parser Markdown
       completo.

       In caso contrario manteniamo comunque leggibile il testo,
       trasformando le interruzioni di riga in paragrafi.
    */

    if (
        typeof marked !== "undefined" &&
        typeof marked.parse === "function"
    ) {

        return marked.parse(testo);

    }

    return testo
        .split(/\n\s*\n/)
        .map(paragrafo =>
            `<p>${paragrafo.replace(/\n/g, "<br>")}</p>`
        )
        .join("");

}
/* =========================================================
   SCHEDA SINGOLO EVENTO / SPETTACOLO
   ========================================================= */

async function caricaSchedaEvento() {

    const contenitore =
        document.getElementById("scheda-evento");

    const parametri =
        new URLSearchParams(window.location.search);

    const idEvento =
        parametri.get("id");

    if (!idEvento) {

        contenitore.innerHTML =
            "<p>Spettacolo non specificato.</p>";

        return;
    }

    try {

        const [
            rispostaEventi,
            rispostaCompagnie
        ] = await Promise.all([

            fetch("data/eventi.json"),
            fetch("data/compagnie.json")

        ]);

        if (
            !rispostaEventi.ok ||
            !rispostaCompagnie.ok
        ) {

            throw new Error(
                "Errore nel caricamento dello spettacolo"
            );

        }

        const eventi =
            await rispostaEventi.json();

        const compagnie =
            await rispostaCompagnie.json();

        const evento =
            eventi.find(
                e =>
                    e.id === idEvento &&
                    e.pubblicato === true
            );

        if (!evento) {

            contenitore.innerHTML =
                "<h2>Spettacolo non trovato</h2>";

            return;
        }

        const datiCompagnia =
            datiCompagniaEvento(
                evento,
                compagnie
            );

        document.title =
            evento.titolo +
            " | Corriere Teatrale";

        const dateHTML =
            evento.date.map(replica => {

                const dataFormattata =
                    formattaData(
                        replica.data,
                        {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }
                    );

                return `

                    <div class="event-detail-date">

                        <strong>
                            ${dataFormattata}
                        </strong>

                        <span>
                            ore ${replica.ora}
                        </span>

                    </div>

                `;

            }).join("");

        contenitore.innerHTML = `

            <article class="event-detail">

                <div class="event-detail-grid">

                    <div class="event-detail-poster">

                        ${evento.locandina ? `

                            <img
                                src="${evento.locandina}"
                                alt="Locandina ${evento.titolo}"
                            >

                        ` : ""}

                    </div>

                    <div class="event-detail-content">

                        <div class="categoria">
                            ${evento.tipo}
                        </div>

                        <h1>
                            ${evento.titolo}
                        </h1>

                        ${datiCompagnia.nome ? `

                            <p class="event-detail-company">

                                di

                                ${
                                    datiCompagnia.url
                                        ? `
                                            <a href="${datiCompagnia.url}">
                                                ${datiCompagnia.nome}
                                            </a>
                                        `
                                        : `
                                            ${datiCompagnia.nome}
                                        `
                                }

                            </p>

                        ` : ""}

                      ${evento.descrizione ? `

    <div class="event-detail-description">
        ${formattaMarkdownEvento(evento.descrizione)}
    </div>

` : ""}

                        <div class="event-detail-block">

                            <h2>
                                Date e orari
                            </h2>

                            ${dateHTML}

                        </div>

                        <div class="event-detail-block">

                            <h2>
                                Dove
                            </h2>

                            <p>

                                <strong>
                                    ${evento.luogo}
                                </strong>

                                ${evento.indirizzo
                                    ? "<br>" + evento.indirizzo
                                    : ""}

                                ${evento.citta
                                    ? "<br>" + evento.citta
                                    : ""}

                                ${evento.quartiere
                                    ? " · " + evento.quartiere
                                    : ""}

                                ${evento.municipio
                                    ? " · Municipio " + evento.municipio
                                    : ""}

                            </p>

                        </div>

                        ${
                            evento.prezzo_intero ||
                            evento.prezzo_ridotto

                            ? `

                                <div class="event-detail-block">

                                    <h2>
                                        Biglietti
                                    </h2>

                                    ${evento.prezzo_intero ? `

                                        <p>

                                            <strong>
                                                Intero:
                                            </strong>

                                            ${evento.prezzo_intero}

                                        </p>

                                    ` : ""}

                                    ${evento.prezzo_ridotto ? `

                                        <p>

                                            <strong>
                                                Ridotto:
                                            </strong>

                                            ${evento.prezzo_ridotto}

                                        </p>

                                    ` : ""}

                                </div>

                            `

                            : ""
                        }

                        ${evento.prenotazioni ? `

                            <div class="event-detail-block">

                                <h2>
                                    Prenotazioni
                                </h2>

                                <p>
                                    ${evento.prenotazioni}
                                </p>

                            </div>

                        ` : ""}

                        ${evento.link ? `

                            <p style="margin-top: 25px;">

                                <a
                                    href="${evento.link}"
                                    target="_blank"
                                    rel="noopener"
                                    class="event-button"
                                >
                                    Prenota / maggiori informazioni
                                </a>

                            </p>

                        ` : ""}

                    </div>

                </div>

            </article>

        `;

    } catch (errore) {

        console.error(errore);

        contenitore.innerHTML =
            "<p>Si è verificato un problema nel caricamento dello spettacolo.</p>";

    }

}


/* =========================================================
   BACHECA
   ========================================================= */

async function caricaAnnunci() {

    const contenitore =
        document.getElementById("elenco-annunci");

    try {

        const [
            rispostaAnnunci,
            rispostaCompagnie
        ] = await Promise.all([

            fetch("data/annunci.json"),
            fetch("data/compagnie.json")

        ]);

        if (
            !rispostaAnnunci.ok ||
            !rispostaCompagnie.ok
        ) {

            throw new Error(
                "Impossibile caricare la Bacheca"
            );

        }

        const annunci =
            await rispostaAnnunci.json();

        const compagnie =
            await rispostaCompagnie.json();

        const annunciVisibili =
            annunci
                .filter(
                    annuncio =>
                        annuncio.pubblicato === true &&
                        !annuncioScaduto(
                            annuncio.data_scadenza
                        )
                )
                .sort(
                    (a, b) =>
                        new Date(b.data_pubblicazione) -
                        new Date(a.data_pubblicazione)
                );


        function mostraAnnunci(categoria = "tutti") {

            const filtrati =
                categoria === "tutti"

                    ? annunciVisibili

                    : annunciVisibili.filter(
                        annuncio =>
                            annuncio.categoria === categoria
                    );


            if (filtrati.length === 0) {

                contenitore.innerHTML = `

                    <div class="bacheca-vuota">

                        <h3>
                            Nessun annuncio
                        </h3>

                        <p>
                            Al momento non ci sono annunci
                            in questa categoria.
                        </p>

                    </div>

                `;

                return;
            }


            contenitore.innerHTML =
                filtrati.map(annuncio => {

                    const compagnia =
                        compagnie.find(
                            c =>
                                c.id ===
                                annuncio.compagnia_id
                        );


                    const dataPubblicazione =
                        formattaData(
                            annuncio.data_pubblicazione,
                            {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            }
                        );


                    const dataScadenza =
                        annuncio.data_scadenza

                            ? formattaData(
                                annuncio.data_scadenza,
                                {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                }
                            )

                            : "";


                    return `

                        <article class="annuncio-card">

                            <div class="annuncio-categoria">
                                ${annuncio.categoria}
                            </div>

                            <h3>
                                ${annuncio.titolo}
                            </h3>

                            ${compagnia ? `

                                <div class="annuncio-compagnia">

                                    <a href="compagnia.html?id=${compagnia.id}">
                                        ${compagnia.nome}
                                    </a>

                                </div>

                            ` : annuncio.autore ? `

                                <div class="annuncio-compagnia">
                                    ${annuncio.autore}
                                </div>

                            ` : ""}

                            <p class="annuncio-descrizione">
                                ${annuncio.descrizione}
                            </p>

                            <div class="annuncio-meta">

                                ${annuncio.citta ? `
                                    ${annuncio.citta}
                                ` : ""}

                                ${annuncio.zona ? `
                                    · ${annuncio.zona}
                                ` : ""}

                                ${annuncio.municipio ? `
                                    · Municipio ${annuncio.municipio}
                                ` : ""}

                                <br>

                                Pubblicato il
                                ${dataPubblicazione}

                                ${dataScadenza ? `

                                    <br>

                                    Scadenza:
                                    <strong>
                                        ${dataScadenza}
                                    </strong>

                                ` : ""}

                                ${annuncio.email ? `

                                    <br><br>

                                    <a href="mailto:${annuncio.email}">
                                        Contatta via email
                                    </a>

                                ` : ""}

                                ${annuncio.telefono ? `

                                    <br>

                                    <strong>
                                        ${annuncio.telefono}
                                    </strong>

                                ` : ""}

                                ${annuncio.link ? `

                                    <br>

                                    <a
                                        href="${annuncio.link}"
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        Maggiori informazioni
                                    </a>

                                ` : ""}

                            </div>

                        </article>

                    `;

                }).join("");

        }


        mostraAnnunci("tutti");


        const pulsanti =
            document.querySelectorAll(
                ".bacheca-filter"
            );


        pulsanti.forEach(pulsante => {

            pulsante.addEventListener(
                "click",
                () => {

                    pulsanti.forEach(
                        bottone =>
                            bottone.classList.remove(
                                "active"
                            )
                    );

                    pulsante.classList.add(
                        "active"
                    );

                    const categoria =
                        pulsante.dataset.categoria;

                    mostraAnnunci(
                        categoria
                    );

                }
            );

        });


    } catch (errore) {

        console.error(errore);

        contenitore.innerHTML = `

            <div class="bacheca-vuota">

                <h3>
                    Bacheca non disponibile
                </h3>

                <p>
                    Si è verificato un problema
                    nel caricamento degli annunci.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   EVENTI HOME
   ========================================================= */

async function caricaEventiHome() {

    const contenitore =
        document.getElementById("home-eventi");

    if (!contenitore) {
        return;
    }

    try {

        const [
            rispostaEventi,
            rispostaCompagnie
        ] = await Promise.all([

            fetch("data/eventi.json"),
            fetch("data/compagnie.json")

        ]);

        if (!rispostaEventi.ok) {
            throw new Error(
                "Impossibile caricare gli eventi"
            );
        }

        const eventi =
            await rispostaEventi.json();

        const compagnie =
            rispostaCompagnie.ok
                ? await rispostaCompagnie.json()
                : [];

        const adesso =
            new Date();

        const eventiFuturi =
            eventi
                .filter(
                    evento =>
                        evento.pubblicato === true
                )

                .map(evento => {

                    const dateFuture =
                        (evento.date || [])
                            .map(dataEvento => {

                                const dataOra =
                                    new Date(
                                        `${dataEvento.data}T${dataEvento.ora || "23:59"}`
                                    );

                                return {
                                    ...dataEvento,
                                    dataOra
                                };

                            })

                            .filter(
                                dataEvento =>
                                    dataEvento.dataOra >= adesso
                            )

                            .sort(
                                (a, b) =>
                                    a.dataOra - b.dataOra
                            );

                    return {
                        ...evento,
                        dateFuture
                    };

                })

                .filter(
                    evento =>
                        evento.dateFuture.length > 0
                )

                .sort(
                    (a, b) =>
                        a.dateFuture[0].dataOra -
                        b.dateFuture[0].dataOra
                )

                .slice(0, 3);


        if (eventiFuturi.length === 0) {

            contenitore.innerHTML = `

                <article class="event-card">

                    <div class="date">
                        PROSSIMAMENTE
                    </div>

                    <h3>
                        Il prossimo spettacolo
                    </h3>

                    <p>
                        Stiamo aggiornando l'agenda
                        di Corriere Teatrale.
                    </p>

                </article>

                <article class="event-card">

                    <div class="date">
                        SEGNALA
                    </div>

                    <h3>
                        Il tuo spettacolo
                    </h3>

                    <p>
                        Hai una nuova produzione?
                        Segnalala alla redazione.
                    </p>

                    <a href="segnala.html">
                        Invia una segnalazione →
                    </a>

                </article>

            `;

            return;
        }


        contenitore.innerHTML =
            eventiFuturi.map(evento => {

                let nomeCompagnia =
                    "Compagnia teatrale";

                let linkCompagnia =
                    "";


                if (
                    evento.compagnia_id ===
                    "i-fatti-in-casa"
                ) {

                    nomeCompagnia =
                        "I FATTI IN CASA APS";

                    linkCompagnia =
                        "i-fatti-in-casa.html";

                } else {

                    const compagnia =
                        compagnie.find(
                            c =>
                                c.id ===
                                evento.compagnia_id
                        );

                    if (compagnia) {

                        nomeCompagnia =
                            compagnia.nome;

                        linkCompagnia =
                            `compagnia.html?id=${compagnia.id}`;

                    }

                }


                const prossimaData =
                    evento.dateFuture[0];


                const dataFormattata =
                    prossimaData.dataOra
                        .toLocaleDateString(
                            "it-IT",
                            {
                                day: "numeric",
                                month: "long"
                            }
                        );


                const compagniaHTML =
                    linkCompagnia

                        ? `
                            <a href="${linkCompagnia}">
                                ${nomeCompagnia}
                            </a>
                          `

                        : nomeCompagnia;


                return `

                    <article class="event-card">

                        <div class="date">
                            ${dataFormattata}
                            ·
                            ${prossimaData.ora || ""}
                        </div>

                        <h3>

                            <a href="evento.html?id=${evento.id}">
                                ${evento.titolo}
                            </a>

                        </h3>

                        <p>

                            ${evento.luogo || ""}

                            ${evento.citta
                                ? ` · ${evento.citta}`
                                : ""
                            }

                            <br>

                            ${compagniaHTML}

                        </p>

                        <a
                            href="evento.html?id=${evento.id}"
                            class="event-link"
                        >
                            Dettagli →
                        </a>

                    </article>

                `;

            }).join("");


    } catch (errore) {

        console.error(
            "Errore caricamento eventi Home:",
            errore
        );

        contenitore.innerHTML = `

            <article class="event-card">

                <div class="date">
                    AGENDA
                </div>

                <h3>
                    Gli spettacoli di Roma
                </h3>

                <p>
                    Consulta l'agenda completa
                    di Corriere Teatrale.
                </p>

                <a href="eventi.html">
                    Vai agli spettacoli →
                </a>

            </article>

        `;

    }

}
/* =========================================================
   BACHECA HOME
   ========================================================= */

async function caricaBachecaHome() {

    const contenitore =
        document.getElementById("home-bacheca");

    if (!contenitore) {
        return;
    }

    try {

        const risposta =
            await fetch("data/annunci.json");

        if (!risposta.ok) {

            throw new Error(
                "Impossibile caricare gli annunci"
            );

        }

        const annunci =
            await risposta.json();

        const annunciVisibili =
            annunci

                .filter(
                    annuncio =>
                        annuncio.pubblicato === true &&
                        !annuncioScaduto(
                            annuncio.data_scadenza
                        )
                )

                .sort(
                    (a, b) =>
                        new Date(b.data_pubblicazione) -
                        new Date(a.data_pubblicazione)
                )

                .slice(0, 3);


        if (annunciVisibili.length === 0) {

            contenitore.innerHTML = `

                <div class="annuncio">

                    <small>
                        BACHECA
                    </small>

                    <h3>
                        La Bacheca aspetta
                        il primo annuncio
                    </h3>

                    <p>
                        Cerchi un attore, un tecnico,
                        una sala prove, del materiale
                        o una collaborazione?
                    </p>

                    <a href="segnala.html">
                        Pubblica una segnalazione →
                    </a>

                </div>

            `;

            return;

        }


        contenitore.innerHTML =
            annunciVisibili.map(annuncio => {

                const dataPubblicazione =
                    formattaData(
                        annuncio.data_pubblicazione,
                        {
                            day: "numeric",
                            month: "long"
                        }
                    );


                return `

                    <div class="annuncio">

                        <small>
                            ${annuncio.categoria || "BACHECA"}
                        </small>

                        <h3>
                            ${annuncio.titolo}
                        </h3>

                        ${
                            annuncio.citta ||
                            annuncio.zona

                            ? `

                                <p>

                                    ${annuncio.citta || ""}

                                    ${
                                        annuncio.zona
                                            ? " · " + annuncio.zona
                                            : ""
                                    }

                                </p>

                              `

                            : ""
                        }

                        <p class="annuncio-data">
                            ${dataPubblicazione}
                        </p>

                    </div>

                `;

            }).join("");


    } catch (errore) {

        console.error(
            "Errore caricamento Bacheca Home:",
            errore
        );

        contenitore.innerHTML = `

            <div class="annuncio">

                <small>
                    BACHECA
                </small>

                <h3>
                    Consulta gli annunci
                </h3>

                <p>
                    Casting, collaborazioni,
                    sale prova e opportunità.
                </p>

                <a href="bacheca.html">
                    Vai alla Bacheca →
                </a>

            </div>

        `;

    }

}


/* =========================================================
   ULTIME STORIE HOME
   NOTIZIE + INTERVISTE
   ========================================================= */

async function caricaNotizieHome() {

    const contenitore =
        document.getElementById("home-notizie");

    if (!contenitore) {
        return;
    }

    try {

        const [
            rispostaNotizie,
            rispostaInterviste
        ] = await Promise.all([

            fetch(
                "data/notizie.json?ts=" +
                Date.now()
            ),

            fetch(
                "data/interviste.json?ts=" +
                Date.now()
            )

        ]);


        if (
            !rispostaNotizie.ok ||
            !rispostaInterviste.ok
        ) {

            throw new Error(
                "Impossibile caricare le ultime storie"
            );

        }


        const notizie =
            await rispostaNotizie.json();

        const interviste =
            await rispostaInterviste.json();


        if (
            !Array.isArray(notizie) ||
            !Array.isArray(interviste)
        ) {

            throw new Error(
                "Formato degli archivi editoriali non valido"
            );

        }


        /*
           Normalizziamo Notizie e Interviste
           in un unico archivio editoriale.

           In questo modo la Home può ordinarle
           semplicemente per data senza preoccuparsi
           della loro provenienza.
        */


        const notizieNormalizzate =
            notizie

                .filter(
                    notizia =>
                        notizia.pubblicato !== false
                )

                .map(
                    notizia => ({

                        tipoContenuto:
                            "notizia",

                        id:
                            notizia.id || "",

                        titolo:
                            notizia.titolo ||
                            "Senza titolo",

                        categoria:
                            notizia.categoria ||
                            "STORIE",

                        occhiello:
                            notizia.occhiello ||
                            "",

                        sommario:
                            notizia.sommario ||
                            "",

                        autore:
                            notizia.autore ||
                            "Redazione Corriere Teatrale",

                        immagine:
                            notizia.immagine ||
                            "",

                        data_pubblicazione:
                            notizia.data_pubblicazione ||
                            "",

                        url:
                            `notizia.html?id=${encodeURIComponent(
                                notizia.id || ""
                            )}`,

                        testoLink:
                            "Leggi la storia"

                    })
                );


        const intervisteNormalizzate =
            interviste

                .filter(
                    intervista =>
                        intervista.pubblicato !== false
                )

                .map(
                    intervista => {

                        const intervistato =
                            intervista.intervistato ||
                            "";

                        const ruolo =
                            intervista.ruolo ||
                            "";

                        const compagnia =
                            intervista.compagnia ||
                            "";


                        let occhiello =
                            "";


                        if (intervistato) {

                            occhiello =
                                intervistato;

                            if (ruolo) {
                                occhiello +=
                                    ` · ${ruolo}`;
                            }

                            if (compagnia) {
                                occhiello +=
                                    ` · ${compagnia}`;
                            }

                        } else if (ruolo) {

                            occhiello =
                                ruolo;

                            if (compagnia) {
                                occhiello +=
                                    ` · ${compagnia}`;
                            }

                        } else if (compagnia) {

                            occhiello =
                                compagnia;

                        }


                        return {

                            tipoContenuto:
                                "intervista",

                            id:
                                intervista.id || "",

                            titolo:
                                intervista.titolo ||
                                "Senza titolo",

                            categoria:
                                "INTERVISTA",

                            occhiello:
                                occhiello,

                            sommario:
                                intervista.introduzione ||
                                "",

                            autore:
                                intervista.autore ||
                                "Redazione Corriere Teatrale",

                            immagine:
                                intervista.immagine ||
                                "",

                            data_pubblicazione:
                                intervista.data_pubblicazione ||
                                "",

                            url:
                                `intervista.html?id=${encodeURIComponent(
                                    intervista.id || ""
                                )}`,

                            testoLink:
                                "Leggi l'intervista"

                        };

                    }
                );


        /*
           Uniamo i due archivi.

           Le pubblicazioni più recenti vengono
           mostrate per prime indipendentemente
           dal fatto che siano una notizia
           o un'intervista.
        */


        const storieVisibili =
            [
                ...notizieNormalizzate,
                ...intervisteNormalizzate
            ]

                .sort(
                    (a, b) =>
                        new Date(
                            b.data_pubblicazione ||
                            "1900-01-01"
                        ) -
                        new Date(
                            a.data_pubblicazione ||
                            "1900-01-01"
                        )
                )

                .slice(0, 3);


        if (storieVisibili.length === 0) {

            contenitore.innerHTML = `

                <article class="article">

                    <span class="categoria">
                        CORRIERE TEATRALE
                    </span>

                    <h3>
                        Le storie stanno per cominciare
                    </h3>

                    <p>
                        In questa sezione racconteremo compagnie,
                        spettacoli e persone del teatro amatoriale
                        romano. Notizie, approfondimenti e interviste
                        da dentro e fuori il palcoscenico.
                    </p>

                    <a href="segnala.html">
                        Hai una storia? Segnalala alla redazione →
                    </a>

                </article>

            `;

            return;

        }


        contenitore.innerHTML =
            storieVisibili

                .map(
                    (storia, indice) => {

                        const titolo =
                            storia.titolo;

                        const categoria =
                            storia.categoria;

                        const occhiello =
                            storia.occhiello;

                        const sommario =
                            storia.sommario;

                        const autore =
                            storia.autore;

                        const immagine =
                            storia.immagine;

                        const url =
                            storia.url;

                        const testoLink =
                            storia.testoLink;


                        const data =
                            storia.data_pubblicazione

                                ? formattaData(
                                    storia.data_pubblicazione,
                                    {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric"
                                    }
                                )

                                : "";


                        /*
                           Il contenuto più recente
                           mantiene l'impaginazione principale
                           già utilizzata dalla Home.
                        */


                        if (indice === 0) {

                            return `

                                <article
                                    class="article"
                                    style="
                                        padding-bottom: 30px;
                                        margin-bottom: 30px;
                                        border-bottom: 1px solid #ccc;
                                    "
                                >

                                    ${
                                        immagine

                                            ? `

                                                <a
                                                    href="${url}"
                                                    style="
                                                        display: block;
                                                        margin-bottom: 18px;
                                                    "
                                                >

                                                    <img
                                                        src="${immagine}"
                                                        alt="${titolo}"
                                                        style="
                                                            display: block;
                                                            width: 100%;
                                                            max-height: 430px;
                                                            object-fit: cover;
                                                        "
                                                    >

                                                </a>

                                              `

                                            : ""
                                    }

                                    <span class="categoria">
                                        ${categoria}
                                    </span>

                                    ${
                                        occhiello

                                            ? `

                                                <div
                                                    style="
                                                        margin-top: 10px;
                                                        margin-bottom: 6px;
                                                        font-family: Georgia, 'Times New Roman', serif;
                                                        font-size: 16px;
                                                        font-style: italic;
                                                        color: #666;
                                                    "
                                                >
                                                    ${occhiello}
                                                </div>

                                              `

                                            : ""
                                    }

                                    <h3
                                        style="
                                            font-size: clamp(27px, 4vw, 38px);
                                            line-height: 1.1;
                                            margin-top: 8px;
                                            margin-bottom: 12px;
                                        "
                                    >

                                        <a href="${url}">
                                            ${titolo}
                                        </a>

                                    </h3>

                                    ${
                                        sommario

                                            ? `

                                                <p
                                                    style="
                                                        font-size: 17px;
                                                        line-height: 1.6;
                                                    "
                                                >
                                                    ${sommario}
                                                </p>

                                              `

                                            : ""
                                    }

                                    <p
                                        style="
                                            margin-top: 14px;
                                            margin-bottom: 14px;
                                            font-size: 13px;
                                            color: #777;
                                        "
                                    >

                                        ${data ? data : ""}

                                        ${
                                            data && autore
                                                ? " · "
                                                : ""
                                        }

                                        ${autore ? autore : ""}

                                    </p>

                                    <a
                                        href="${url}"
                                        style="font-weight: 700;"
                                    >
                                        ${testoLink} →
                                    </a>

                                </article>

                            `;

                        }


                        /*
                           Seconda e terza pubblicazione:
                           formato più compatto.
                        */


                        return `

                            <article
                                class="article"
                                style="
                                    padding-bottom: 25px;
                                    margin-bottom: 25px;
                                    border-bottom: 1px solid #ddd;
                                "
                            >

                                ${
                                    immagine

                                        ? `

                                            <a
                                                href="${url}"
                                                style="
                                                    display: block;
                                                    margin-bottom: 14px;
                                                "
                                            >

                                                <img
                                                    src="${immagine}"
                                                    alt="${titolo}"
                                                    style="
                                                        display: block;
                                                        width: 100%;
                                                        max-height: 280px;
                                                        object-fit: cover;
                                                    "
                                                >

                                            </a>

                                          `

                                        : ""
                                }

                                <span class="categoria">
                                    ${categoria}
                                </span>

                                ${
                                    occhiello

                                        ? `

                                            <div
                                                style="
                                                    margin-top: 8px;
                                                    margin-bottom: 5px;
                                                    font-family: Georgia, 'Times New Roman', serif;
                                                    font-size: 15px;
                                                    font-style: italic;
                                                    color: #666;
                                                "
                                            >
                                                ${occhiello}
                                            </div>

                                          `

                                        : ""
                                }

                                <h3>

                                    <a href="${url}">
                                        ${titolo}
                                    </a>

                                </h3>

                                ${
                                    sommario
                                        ? `<p>${sommario}</p>`
                                        : ""
                                }

                                <p
                                    style="
                                        margin-top: 10px;
                                        margin-bottom: 12px;
                                        font-size: 13px;
                                        color: #777;
                                    "
                                >

                                    ${data ? data : ""}

                                    ${
                                        data && autore
                                            ? " · "
                                            : ""
                                    }

                                    ${autore ? autore : ""}

                                </p>

                                <a href="${url}">
                                    ${testoLink} →
                                </a>

                            </article>

                        `;

                    }
                )

                .join("");


    } catch (errore) {

        console.error(
            "Errore caricamento Ultime Storie Home:",
            errore
        );

        contenitore.innerHTML = `

            <article class="article">

                <span class="categoria">
                    CORRIERE TEATRALE
                </span>

                <h3>
                    Le storie di Corriere Teatrale
                </h3>

                <p>
                    Consulta notizie, racconti e interviste
                    dal teatro amatoriale romano.
                </p>

                <a href="notizie.html">
                    Vai alle Notizie →
                </a>

            </article>

        `;

    }

}
