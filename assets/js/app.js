document.addEventListener("DOMContentLoaded", () => {

    const elencoCompagnie =
        document.getElementById("elenco-compagnie");

    const elencoEventi =
        document.getElementById("elenco-eventi");

    const schedaCompagnia =
        document.getElementById("scheda-compagnia");

    const schedaEvento =
        document.getElementById("scheda-evento");


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

});


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

                const compagnia =
                    compagnie.find(
                        c =>
                            c.id === evento.compagnia_id
                    );

                const nomeCompagnia =
                    compagnia
                        ? compagnia.nome
                        : "Compagnia teatrale";

                const dateHTML =
                    evento.date.map(replica => {

                        const data =
                            new Date(
                                replica.data +
                                "T12:00:00"
                            );

                        const dataFormattata =
                            data.toLocaleDateString(
                                "it-IT",
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
                            <strong>
                                ${nomeCompagnia}
                            </strong>
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

                            const data =
                                new Date(
                                    replica.data +
                                    "T12:00:00"
                                );

                            const dataFormattata =
                                data.toLocaleDateString(
                                    "it-IT",
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
                                <strong>Generi:</strong>
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

        const compagnia =
            compagnie.find(
                c =>
                    c.id === evento.compagnia_id
            );

        document.title =
            evento.titolo +
            " | Corriere Teatrale";


        const dateHTML =
            evento.date.map(replica => {

                const data =
                    new Date(
                        replica.data +
                        "T12:00:00"
                    );

                const dataFormattata =
                    data.toLocaleDateString(
                        "it-IT",
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


                        ${compagnia ? `

                            <p class="event-detail-company">

                                di

                                <a href="compagnia.html?id=${compagnia.id}">
                                    ${compagnia.nome}
                                </a>

                            </p>

                        ` : ""}


                        ${evento.descrizione ? `

                            <p class="event-detail-description">
                                ${evento.descrizione}
                            </p>

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
                                            <strong>Intero:</strong>
                                            ${evento.prezzo_intero}
                                        </p>
                                    ` : ""}

                                    ${evento.prezzo_ridotto ? `
                                        <p>
                                            <strong>Ridotto:</strong>
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
