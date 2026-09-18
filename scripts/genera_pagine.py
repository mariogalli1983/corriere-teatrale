import json
import html
import re
from pathlib import Path


BASE_URL = "https://corriereteatrale.it"
FALLBACK_IMAGE = f"{BASE_URL}/header-corriere-teatrale.jpg"

CARTELLA_EVENTI = Path("data/eventi")
CARTELLA_SPETTACOLI = Path("spettacoli")


def pulisci_markdown(testo):
    """Trasforma il Markdown in testo semplice per le anteprime social."""

    if not testo:
        return ""

    testo = re.sub(
        r"^#{1,6}\s*",
        "",
        testo,
        flags=re.MULTILINE
    )

    testo = re.sub(
        r"\*\*(.*?)\*\*",
        r"\1",
        testo
    )

    testo = re.sub(
        r"\*(.*?)\*",
        r"\1",
        testo
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
        r"\s+",
        " ",
        testo
    ).strip()

    if len(testo) > 240:
        testo = testo[:237].rstrip() + "..."

    return testo


def determina_immagine(locandina):
    """Restituisce l'immagine assoluta da usare nelle anteprime social."""

    if not locandina:
        return FALLBACK_IMAGE

    locandina = str(locandina).strip()

    if not locandina:
        return FALLBACK_IMAGE

    if (
        locandina.startswith("http://")
        or locandina.startswith("https://")
    ):
        return locandina

    return f"{BASE_URL}/{locandina.lstrip('/')}"


def genera_pagina(evento):
    """Genera la pagina HTML permalink di un singolo spettacolo."""

    event_id = str(
        evento.get("id", "")
    ).strip()

    if not event_id:
        return

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
        f"Generata pagina: {file_html}"
    )


def main():

    if not CARTELLA_EVENTI.exists():

        print(
            "La cartella data/eventi non esiste."
        )

        return

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

        genera_pagina(
            evento
        )

        numero_generate += 1

    print(
        f"Pagine spettacoli generate: "
        f"{numero_generate}"
    )


if __name__ == "__main__":
    main()
