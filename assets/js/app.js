document.addEventListener("DOMContentLoaded", () => {

    const elencoCompagnie =
        document.getElementById("elenco-compagnie");

    const elencoEventi =
        document.getElementById("elenco-eventi");

    if (elencoCompagnie) {
        caricaCompagnie();
    }

    if (elencoEventi) {
        caricaEventi();
    }

});

async function caricaCompagnie() {

    const contenitore = document.getElementById("elenco-compagnie");

    try {

        const risposta = await fetch("data/compagnie.json");

        if (!risposta.ok) {
            throw new Error("Impossibile caricare le compagnie");
        }

        const compagnie = await risposta.json();

        const compagnieAttive = compagnie.filter(
            compagnia => compagnia.attiva === true
        );

        if (compagnieAttive.length === 0) {
            contenitore.innerHTML =
                "<p>Non ci sono ancora compagnie pubblicate.</p>";
            return;
        }

        contenitore.innerHTML = compagnieAttive.map(compagnia => {

            const generi = compagnia.generi
                ? compagnia.generi.join(" · ")
                : "";

            return `
                <article class="company-card">

                    <div class="categoria">
                        ${compagnia.tipologia}
                    </div>

                    <h3>${compagnia.nome}</h3>

                    <p>
                        ${compagnia.citta}
                        ${compagnia.zona ? " · " + compagnia.zona : ""}
                        ${compagnia.municipio ? " · Municipio " + compagnia.municipio : ""}
                    </p>

                    <p>${compagnia.descrizione}</p>

                    ${generi ? `<p><strong>${generi}</strong></p>` : ""}

                </article>
            `;

        }).join("");

    } catch (errore) {

        console.error(errore);

        contenitore.innerHTML =
            "<p>Si è verificato un problema nel caricamento delle compagnie.</p>";
    }
}
async function caricaEventi() {

    const contenitore =
        document.getElementById("elenco-eventi");

    try {

        const [rispostaEventi, rispostaCompagnie] =
            await Promise.all([
                fetch("data/eventi.json"),
                fetch("data/compagnie.json")
            ]);

        if (!rispostaEventi.ok || !rispostaCompagnie.ok) {
            throw new Error("Impossibile caricare gli eventi");
        }

        const eventi = await rispostaEventi.json();
        const compagnie = await rispostaCompagnie.json();

        const eventiPubblicati =
            eventi.filter(evento => evento.pubblicato === true);

        if (eventiPubblicati.length === 0) {
            contenitore.innerHTML =
                "<p>Non ci sono eventi in programma.</p>";
            return;
        }

        contenitore.innerHTML =
            eventiPubblicati.map(evento => {

                const compagnia =
                    compagnie.find(
                        c => c.id === evento.compagnia_id
                    );

                const nomeCompagnia =
                    compagnia
                        ? compagnia.nome
                        : "Compagnia teatrale";

                const dateHTML =
                    evento.date.map(replica => {

                        const data =
                            new Date(
                                replica.data + "T12:00:00"
                            );

                        const dataFormattata =
                            data.toLocaleDateString(
                                "it-IT",
                                {
                                    day: "numeric",
                                    month: "long"
                                }
                            );

                        return `
                            <div>
                                <strong>${dataFormattata}</strong>
                                · ${replica.ora}
                            </div>
                        `;

                    }).join("");

                return `
                    <article class="event-card">

                        <div class="categoria">
                            ${evento.tipo}
                        </div>

                        <h3>${evento.titolo}</h3>

                        <p>
                            <strong>${nomeCompagnia}</strong>
                        </p>

                        <div style="margin: 12px 0;">
                            ${dateHTML}
                        </div>

                        <p>
                            ${evento.luogo}<br>
                            ${evento.indirizzo}<br>
                            ${evento.quartiere}
                            · Municipio ${evento.municipio}
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
