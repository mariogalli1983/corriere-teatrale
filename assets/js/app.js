document.addEventListener("DOMContentLoaded", () => {

    const elencoCompagnie = document.getElementById("elenco-compagnie");

    if (elencoCompagnie) {
        caricaCompagnie();
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
