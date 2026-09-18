import json
import html
import re
from pathlib import Path


BASE_URL = "https://corriereteatrale.it"
FALLBACK_IMAGE = f"{BASE_URL}/header-corriere-teatrale.jpg"

CARTELLA_EVENTI = Path("data/eventi")
CARTELLA_SPETTACOLI = Path("spettacoli")

CARTELLA_NOTIZIE = Path("data/notizie")
CARTELLA_PAGINE_NOTIZIE = Path("notizie")


def pulisci_markdown(testo):
    """Trasforma il Markdown in testo semplice per le anteprime social."""

    if not testo:
        return ""

    testo = re.sub(
        r"^#{1,6}\s*",
        "",
        str(testo),
        flags=re.MULTILINE
    )

    testo = re.sub(
        r"!\[([^\]]*)\]\([^)]+\)",
        r"\1",
        testo
    )

    testo = re.sub(
        r"\[([^\]]+)\]\([^)]+\)",
        r"\1",
        testo
    )

    testo = re.sub(
        r"\*\*(.*?)\*\*",
        r"\1",
        testo
    )

    testo = re.sub(
        r"__(.*?)__",
        r"\1",
        testo
    )

    testo = re.sub(
        r"\*(.*?)\*",
        r"\1",
        testo
    )

    testo = re.sub(
        r"_(.*?)_",
        r"\1",
        testo
    )

    testo = re.sub(
        r"`([^`]*)`",
        r"\1",
        testo
    )

    testo = re.sub(
        r"^\s*[-*+]\s+",
        "",
        testo,
        flags=re.MULTILINE
    )

    testo = re.sub(
        r"\s+",
        " ",
        testo
    ).strip()

    if len(testo) > 240:
        testo = testo[:237].rstrip() + "..."

    return testo


def determina_immagine(immagine):
    """Restituisce un URL assoluto per l'immagine social."""

    if not immagine:
        return FALLBACK_IMAGE

    immagine = str(immagine).strip()

    if not immagine:
        return FALLBACK_IMAGE

    if (
        immagine.startswith("http://")
        or immagine.startswith("https://")
    ):
        return immagine

    return f"{BASE_URL}/{immagine.lstrip('/')}"


def genera_pagina(evento):
    """Genera la pagina HTML permalink di un singolo spettacolo."""

    event_id = str(
        evento.get("id", "")
    ).strip()

    if not event_id:
        return None

    titolo = str(
        evento.get(
            "titolo",
            "Spettacolo"
        )
    ).strip()

    descrizione = pulisci_markdown(
        evento.get(
            "descrizione",
            ""
        )
    )

    if not descrizione:
        descrizione = (
            "Spettacolo segnalato da Corriere Teatrale, "
            "il giornale del teatro amatoriale romano."
        )

    immagine = determina_immagine(
        evento.get(
            "locandina",
            ""
        )
    )

    url = (
        f"{BASE_URL}/spettacoli/"
        f"{event_id}/"
    )

    titolo_html = html.escape(
        titolo,
        quote=True
    )

    descrizione_html = html.escape(
        descrizione,
        quote=True
    )

    immagine_html = html.escape(
        immagine,
        quote=True
    )

    url_html = html.escape(
        url,
        quote=True
    )

    event_id_js = json.dumps(
        event_id,
        ensure_ascii=False
    )

    pagina = f"""<!DOCTYPE html>
<html lang="it">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <base href="{BASE_URL}/">

    <title>{titolo_html} | Corriere Teatrale</title>

    <meta name="description"
          content="{descrizione_html}">

    <link rel="canonical"
          href="{url_html}">

    <meta property="og:type"
          content="article">

    <meta property="og:site_name"
          content="Corriere Teatrale">

    <meta property="og:locale"
          content="it_IT">

    <meta property="og:title"
          content="{titolo_html}">

    <meta property="og:description"
          content="{descrizione_html}">

    <meta property="og:url"
          content="{url_html}">

    <meta property="og:image"
          content="{immagine_html}">

    <meta property="og:image:secure_url"
          content="{immagine_html}">

    <meta property="og:image:alt"
          content="Locandina di {titolo_html}">

    <meta name="twitter:card"
          content="summary_large_image">

    <meta name="twitter:title"
          content="{titolo_html}">

    <meta name="twitter:description"
          content="{descrizione_html}">

    <meta name="twitter:image"
          content="{immagine_html}">

    <link rel="icon"
          href="logo-corriere-teatrale.jpg">

    <link rel="stylesheet"
          href="assets/css/style.css">

</head>

<body>


<div class="topbar">
    ROMA · CORRIERE TEATRALE
</div>


<header class="masthead">

    <div class="brand">

        <a href="index.html">

            <img
                src="logo-corriere-teatrale.jpg"
                alt="Corriere Teatrale"
            >

        </a>


        <div>

            <a href="index.html">

                <h1>
                    CORRIERE
                    <span>TEATRALE</span>
                </h1>

            </a>

            <p>
                Il giornale del teatro amatoriale romano
            </p>

        </div>

    </div>


    <div class="official">

        Organo ufficiale di<br>

        <a href="i-fatti-in-casa.html">

            <strong>
                I FATTI IN CASA APS
            </strong>

        </a>

    </div>

</header>


<nav class="main-nav">

    <div class="nav-mobile-bar">

        <span class="nav-mobile-title">
            MENU
        </span>

        <button
            class="menu-toggle"
            type="button"
            aria-label="Apri menu"
            aria-expanded="false"
            aria-controls="menu-principale"
        >

            <span></span>
            <span></span>
            <span></span>

        </button>

    </div>


    <div
        class="nav-inner"
        id="menu-principale"
    >

        <a href="index.html">
            Home
        </a>

        <a href="notizie.html">
            Notizie
        </a>

        <a
            href="eventi.html"
            class="active"
        >
            Spettacoli
        </a>

        <a href="compagnie.html">
            Compagnie
        </a>

        <a href="interviste.html">
            Interviste
        </a>

        <a href="bacheca.html">
            Bacheca
        </a>

        <a href="chi-siamo.html">
            Chi siamo
        </a>

        <a
            href="segnala.html"
            class="segnala"
        >
            Segnala
        </a>

    </div>

</nav>


<main>

    <div id="scheda-evento">

        <p>
            Caricamento spettacolo...
        </p>

    </div>

</main>


<footer>

    <div class="footer-inner">

        <div>

            <strong>
                CORRIERE TEATRALE
            </strong>

            <p>
                Il giornale del teatro amatoriale romano.
            </p>

        </div>


        <div>

            <p>

                Organo ufficiale di<br>

                <a href="i-fatti-in-casa.html">

                    <strong>
                        I FATTI IN CASA APS
                    </strong>

                </a>

            </p>

        </div>


        <div>

            <p>

                <a href="privacy.html">
                    Privacy
                </a>

                ·

                <a href="disclaimer.html">
                    Disclaimer
                </a>

                ·

                <a href="faq.html">
                    FAQ
                </a>

            </p>

        </div>

    </div>

</footer>


<script>
    window.CORRIERE_TEATRALE_EVENTO_ID = {event_id_js};
</script>


<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>


<script>
    const parametroOriginale =
        URLSearchParams.prototype.get;

    URLSearchParams.prototype.get = function(nome) {{

        if (
            nome === "id" &&
            window.CORRIERE_TEATRALE_EVENTO_ID
        ) {{
            return window.CORRIERE_TEATRALE_EVENTO_ID;
        }}

        return parametroOriginale.call(
            this,
            nome
        );
    }};
</script>


<script src="assets/js/app.js"></script>


</body>

</html>
"""

    destinazione = (
        CARTELLA_SPETTACOLI /
        event_id
    )

    destinazione.mkdir(
        parents=True,
        exist_ok=True
    )

    file_html = (
        destinazione /
        "index.html"
    )

    file_html.write_text(
        pagina,
        encoding="utf-8"
    )

    print(
        f"Generata pagina spettacolo: {file_html}"
    )

    return file_html
   def trova_immagine_notizia(notizia):
    """Cerca l'immagine principale della notizia."""

    possibili_campi = [
        "immagine",
        "immagine_principale",
        "foto",
        "copertina"
    ]

    for campo in possibili_campi:

        valore = notizia.get(campo)

        if valore:
            return determina_immagine(valore)

    immagini = notizia.get("immagini")

    if isinstance(immagini, list) and immagini:

        prima_immagine = immagini[0]

        if isinstance(prima_immagine, str):
            return determina_immagine(
                prima_immagine
            )

        if isinstance(prima_immagine, dict):

            for campo in [
                "immagine",
                "src",
                "url",
                "file"
            ]:

                valore = prima_immagine.get(campo)

                if valore:
                    return determina_immagine(
                        valore
                    )

    return FALLBACK_IMAGE


def genera_pagina_notizia(notizia):
    """Genera la pagina permalink di una singola notizia."""

    notizia_id = str(
        notizia.get("id", "")
    ).strip()

    if not notizia_id:
        return None

    titolo = str(
        notizia.get(
            "titolo",
            "Notizia"
        )
    ).strip()

    descrizione = ""

    for campo in [
        "sottotitolo",
        "occhiello",
        "descrizione",
        "testo",
        "contenuto"
    ]:

        valore = notizia.get(campo)

        if valore:

            descrizione = pulisci_markdown(
                valore
            )

            if descrizione:
                break

    if not descrizione:
        descrizione = (
            "Notizie, storie e approfondimenti "
            "dal teatro amatoriale romano."
        )

    immagine = trova_immagine_notizia(
        notizia
    )

    url = (
        f"{BASE_URL}/notizie/"
        f"{notizia_id}/"
    )

    titolo_html = html.escape(
        titolo,
        quote=True
    )

    descrizione_html = html.escape(
        descrizione,
        quote=True
    )

    immagine_html = html.escape(
        immagine,
        quote=True
    )

    url_html = html.escape(
        url,
        quote=True
    )

    notizia_id_js = json.dumps(
        notizia_id,
        ensure_ascii=False
    )

    pagina = f"""<!DOCTYPE html>
<html lang="it">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <base href="{BASE_URL}/">

    <title>{titolo_html} | Corriere Teatrale</title>

    <meta name="description"
          content="{descrizione_html}">

    <link rel="canonical"
          href="{url_html}">

    <meta property="og:type"
          content="article">

    <meta property="og:site_name"
          content="Corriere Teatrale">

    <meta property="og:locale"
          content="it_IT">

    <meta property="og:title"
          content="{titolo_html}">

    <meta property="og:description"
          content="{descrizione_html}">

    <meta property="og:url"
          content="{url_html}">

    <meta property="og:image"
          content="{immagine_html}">

    <meta property="og:image:secure_url"
          content="{immagine_html}">

    <meta property="og:image:alt"
          content="Immagine dell'articolo {titolo_html}">

    <meta name="twitter:card"
          content="summary_large_image">

    <meta name="twitter:title"
          content="{titolo_html}">

    <meta name="twitter:description"
          content="{descrizione_html}">

    <meta name="twitter:image"
          content="{immagine_html}">

    <link rel="icon"
          href="logo-corriere-teatrale.jpg">

    <link rel="stylesheet"
          href="assets/css/style.css">

</head>


<body>


<div class="topbar">
    ROMA · CORRIERE TEATRALE
</div>


<header class="masthead">

    <div class="brand">

        <a href="index.html">

            <img
                src="logo-corriere-teatrale.jpg"
                alt="Corriere Teatrale"
            >

        </a>


        <div>

            <a href="index.html">

                <h1>
                    CORRIERE
                    <span>TEATRALE</span>
                </h1>

            </a>

            <p>
                Il giornale del teatro amatoriale romano
            </p>

        </div>

    </div>


    <div class="official">

        Organo ufficiale di<br>

        <a href="i-fatti-in-casa.html">

            <strong>
                I FATTI IN CASA APS
            </strong>

        </a>

    </div>

</header>


<nav class="main-nav">

    <div class="nav-mobile-bar">

        <span class="nav-mobile-title">
            MENU
        </span>

        <button
            class="menu-toggle"
            type="button"
            aria-label="Apri menu"
            aria-expanded="false"
            aria-controls="menu-principale"
        >

            <span></span>
            <span></span>
            <span></span>

        </button>

    </div>


    <div
        class="nav-inner"
        id="menu-principale"
    >

        <a href="index.html">
            Home
        </a>

        <a
            href="notizie.html"
            class="active"
        >
            Notizie
        </a>

        <a href="eventi.html">
            Spettacoli
        </a>

        <a href="compagnie.html">
            Compagnie
        </a>

        <a href="interviste.html">
            Interviste
        </a>

        <a href="bacheca.html">
            Bacheca
        </a>

        <a href="chi-siamo.html">
            Chi siamo
        </a>

        <a
            href="segnala.html"
            class="segnala"
        >
            Segnala
        </a>

    </div>

</nav>


<main>

    <div id="scheda-notizia">

        <p>
            Caricamento notizia...
        </p>

    </div>

</main>


<footer>

    <div class="footer-inner">

        <div>

            <strong>
                CORRIERE TEATRALE
            </strong>

            <p>
                Il giornale del teatro amatoriale romano.
            </p>

        </div>


        <div>

            <p>

                Organo ufficiale di<br>

                <a href="i-fatti-in-casa.html">

                    <strong>
                        I FATTI IN CASA APS
                    </strong>

                </a>

            </p>

        </div>


        <div>

            <p>

                <a href="privacy.html">
                    Privacy
                </a>

                ·

                <a href="disclaimer.html">
                    Disclaimer
                </a>

                ·

                <a href="faq.html">
                    FAQ
                </a>

            </p>

        </div>

    </div>

</footer>


<script>
    window.CORRIERE_TEATRALE_NOTIZIA_ID = {notizia_id_js};
</script>


<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>


<script>
    const parametroOriginaleNotizia =
        URLSearchParams.prototype.get;

    URLSearchParams.prototype.get = function(nome) {{

        if (
            nome === "id" &&
            window.CORRIERE_TEATRALE_NOTIZIA_ID
        ) {{
            return window.CORRIERE_TEATRALE_NOTIZIA_ID;
        }}

        return parametroOriginaleNotizia.call(
            this,
            nome
        );
    }};
</script>


<script src="assets/js/app.js"></script>


<script>

    /*
     * La pagina originale notizia.html contiene già
     * il caricamento della notizia.
     *
     * Se tale logica è definita direttamente nella pagina
     * e non in app.js, il permalink effettua il passaggio
     * trasparente alla pagina originale mantenendo
     * comunque i metadati social statici sopra.
     */

    window.addEventListener(
        "load",
        function () {

            const contenitore =
                document.getElementById(
                    "scheda-notizia"
                );

            if (
                contenitore &&
                contenitore.textContent
                    .includes("Caricamento notizia")
            ) {

                window.location.replace(
                    "notizia.html?id=" +
                    encodeURIComponent(
                        window.CORRIERE_TEATRALE_NOTIZIA_ID
                    )
                );

            }

        }
    );

</script>


</body>

</html>
"""

    destinazione = (
        CARTELLA_PAGINE_NOTIZIE /
        notizia_id
    )

    destinazione.mkdir(
        parents=True,
        exist_ok=True
    )

    file_html = (
        destinazione /
        "index.html"
    )

    file_html.write_text(
        pagina,
        encoding="utf-8"
    )

    print(
        f"Generata pagina notizia: {file_html}"
    )

    return file_html
    def genera_spettacoli():
    """Genera tutti i permalink degli spettacoli pubblicati."""

    if not CARTELLA_EVENTI.exists():

        print(
            "La cartella data/eventi non esiste."
        )

        return 0

    CARTELLA_SPETTACOLI.mkdir(
        parents=True,
        exist_ok=True
    )

    numero_generate = 0

    for file_json in sorted(
        CARTELLA_EVENTI.glob("*.json")
    ):

        try:

            with file_json.open(
                "r",
                encoding="utf-8"
            ) as file:

                evento = json.load(file)

        except Exception as errore:

            print(
                f"Errore nella lettura di {file_json}: "
                f"{errore}"
            )

            continue

        if evento.get("pubblicato") is not True:
            continue

        if not evento.get("id"):
            continue

        risultato = genera_pagina(
            evento
        )

        if risultato:
            numero_generate += 1

    return numero_generate


def genera_notizie():
    """Genera tutti i permalink delle notizie pubblicate."""

    if not CARTELLA_NOTIZIE.exists():

        print(
            "La cartella data/notizie non esiste."
        )

        return 0

    CARTELLA_PAGINE_NOTIZIE.mkdir(
        parents=True,
        exist_ok=True
    )

    numero_generate = 0

    for file_json in sorted(
        CARTELLA_NOTIZIE.glob("*.json")
    ):

        try:

            with file_json.open(
                "r",
                encoding="utf-8"
            ) as file:

                notizia = json.load(file)

        except Exception as errore:

            print(
                f"Errore nella lettura di {file_json}: "
                f"{errore}"
            )

            continue

        if notizia.get("id"):
            risultato = genera_pagina_notizia(
                notizia
            )

            if risultato:
                numero_generate += 1

    return numero_generate


def main():

    numero_spettacoli = genera_spettacoli()

    print(
        f"Pagine spettacoli generate: "
        f"{numero_spettacoli}"
    )

    numero_notizie = genera_notizie()

    print(
        f"Pagine notizie generate: "
        f"{numero_notizie}"
    )

    print(
        "Generazione pagine completata."
    )


if __name__ == "__main__":
    main()
