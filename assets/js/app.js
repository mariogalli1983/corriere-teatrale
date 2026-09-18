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


    /* =========================================================
       CONTENITORI DELLE PAGINE
       ========================================================= */

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


    /* =========================================================
       AVVIO FUNZIONI
       ========================================================= */

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
   NOTIZIE HOME
   ========================================================= */

async function caricaNotizieHome() {

    const contenitore =
        document.getElementById("home-notizie");

    if (!contenitore) {
        return;
    }

    try {

        /*
         * Aggiungiamo un timestamp alla richiesta
         * per evitare che il browser mostri una vecchia
         * versione dell'indice delle notizie.
         */

        const risposta =
            await fetch(
                "data/notizie.json?ts=" + Date.now()
            );


        if (!risposta.ok) {

            throw new Error(
                "Impossibile caricare le notizie"
            );

        }


        const notizie =
            await risposta.json();


        /*
         * Controlliamo che l'indice sia realmente
         * un elenco di notizie.
         */

        if (!Array.isArray(notizie)) {

            throw new Error(
                "Formato dell'archivio notizie non valido"
            );

        }


        /*
         * Mostriamo soltanto le notizie pubblicate.
         *
         * Le ordiniamo dalla più recente alla più vecchia
         * e prendiamo al massimo le prime tre.
         */

        const notizieVisibili =
            notizie

                .filter(
                    notizia =>
                        notizia.pubblicato !== false
                )

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


        /*
         * Se non esistono ancora articoli pubblicati,
         * manteniamo il messaggio introduttivo
         * della Home.
         */

        if (notizieVisibili.length === 0) {

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
                        romano. Notizie, approfondimenti e storie
                        da dentro e fuori il palcoscenico.
                    </p>

                    <a href="segnala.html">
                        Hai una storia? Segnalala alla redazione →
                    </a>

                </article>

            `;

            return;

        }


        /*
         * Costruiamo le ultime storie.
         */

        contenitore.innerHTML =
            notizieVisibili

                .map(
                    (notizia, indice) => {

                        const id =
                            notizia.id || "";

                        const titolo =
                            notizia.titolo ||
                            "Senza titolo";

                        const categoria =
                            notizia.categoria ||
                            "NOTIZIE";

                        const occhiello =
                            notizia.occhiello ||
                            "";

                        const sommario =
                            notizia.sommario ||
                            "";

                        const autore =
                            notizia.autore ||
                            "Redazione Corriere Teatrale";

                        const immagine =
                            notizia.immagine ||
                            "";

                        const data =
                            notizia.data_pubblicazione
                                ? formattaData(
                                    notizia.data_pubblicazione,
                                    {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric"
                                    }
                                )
                                : "";


                        /*
                         * La prima notizia ha un trattamento
                         * leggermente più importante.
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
                                                    href="notizia.html?id=${encodeURIComponent(id)}"
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

                                        <a
                                            href="notizia.html?id=${encodeURIComponent(id)}"
                                        >
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

                                        ${
                                            data
                                                ? `${data}`
                                                : ""
                                        }

                                        ${
                                            data && autore
                                                ? " · "
                                                : ""
                                        }

                                        ${
                                            autore
                                                ? `${autore}`
                                                : ""
                                        }

                                    </p>


                                    <a
                                        href="notizia.html?id=${encodeURIComponent(id)}"
                                        style="
                                            font-weight: 700;
                                        "
                                    >
                                        Leggi la storia →
                                    </a>

                                </article>

                            `;

                        }


                        /*
                         * Seconda e terza notizia:
                         * formato più compatto.
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
                                                href="notizia.html?id=${encodeURIComponent(id)}"
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


                                <h3>

                                    <a
                                        href="notizia.html?id=${encodeURIComponent(id)}"
                                    >
                                        ${titolo}
                                    </a>

                                </h3>


                                ${
                                    sommario
                                        ? `

                                            <p>
                                                ${sommario}
                                            </p>

                                          `
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

                                    ${
                                        data
                                            ? `${data}`
                                            : ""
                                    }

                                    ${
                                        data && autore
                                            ? " · "
                                            : ""
                                    }

                                    ${
                                        autore
                                            ? `${autore}`
                                            : ""
                                    }

                                </p>


                                <a
                                    href="notizia.html?id=${encodeURIComponent(id)}"
                                >
                                    Leggi →
                                </a>

                            </article>

                        `;

                    }
                )

                .join("");


    } catch (errore) {

        console.error(
            "Errore caricamento Notizie Home:",
            errore
        );


        /*
         * Se per qualsiasi motivo l'indice non fosse
         * raggiungibile, la Home non resta vuota.
         */

        contenitore.innerHTML = `

            <article class="article">

                <span class="categoria">
                    CORRIERE TEATRALE
                </span>

                <h3>
                    Le storie di Corriere Teatrale
                </h3>

                <p>
                    Consulta notizie, racconti e approfondimenti
                    dal teatro amatoriale romano.
                </p>

                <a href="notizie.html">
                    Vai alle Notizie →
                </a>

            </article>

        `;

    }

}
