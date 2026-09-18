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
TEMPLATE_NOTIZIA = Path("notizia.html")

CARTELLA_INTERVISTE = Path("data/interviste")
CARTELLA_PAGINE_INTERVISTE = Path("interviste")
TEMPLATE_INTERVISTA = Path("intervista.html")


def pulisci_markdown(testo):
    """Trasforma il Markdown in testo semplice per le anteprime social."""

    if not testo:
        return ""

    testo = str(testo)

    testo = re.sub(
        r"^#{1,6}\s*",
        "",
        testo,
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
        r"\s+",
        " ",
        testo
    ).strip()

    if len(testo) > 240:
        testo = testo[:237].rstrip() + "..."

    return testo


def determina_immagine(valore):
    """Trasforma il percorso di un'immagine in URL assoluto."""

    if not valore:
        return FALLBACK_IMAGE

    valore = str(valore).strip()

    if not valore:
        return FALLBACK_IMAGE

    if valore.startswith(
        (
            "http://",
            "https://"
        )
    ):
        return valore

    return f"{BASE_URL}/{valore.lstrip('/')}"


def prima_immagine_markdown(testo):
    """Trova la prima immagine Markdown non vuota nel testo."""

    if not testo:
        return ""

    for risultato in re.finditer(
        r"!\[[^\]]*\]\(([^)]*)\)",
        str(testo)
    ):

        immagine = risultato.group(1).strip()

        if immagine:
            return immagine

    return ""


def crea_meta_social(
    titolo,
    descrizione,
    immagine,
    url
):
    """Crea canonical, Open Graph e Twitter Card."""

    titolo_html = html.escape(
        str(titolo),
        quote=True
    )

    descrizione_html = html.escape(
        str(descrizione),
        quote=True
    )

    immagine_html = html.escape(
        str(immagine),
        quote=True
    )

    url_html = html.escape(
        str(url),
        quote=True
    )

    return f"""
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
          content="{titolo_html}">

    <meta name="twitter:card"
          content="summary_large_image">

    <meta name="twitter:title"
          content="{titolo_html}">

    <meta name="twitter:description"
          content="{descrizione_html}">

    <meta name="twitter:image"
          content="{immagine_html}">
"""


def prepara_template(
    template_html,
    titolo,
    descrizione,
    immagine,
    url,
    contenuto_id
):
    """
    Trasforma notizia.html o intervista.html
    in una pagina permalink statica.
    """

    pagina = template_html

    titolo_html = html.escape(
        str(titolo),
        quote=True
    )

    descrizione_html = html.escape(
        str(descrizione),
        quote=True
    )

    pagina = re.sub(
        r"<title>.*?</title>",
        f"<title>{titolo_html} | Corriere Teatrale</title>",
        pagina,
        count=1,
        flags=re.DOTALL | re.IGNORECASE
    )

    pagina = re.sub(
        r'<meta\s+name=["\']description["\'][^>]*>',
        (
            '<meta name="description" '
            f'content="{descrizione_html}">'
        ),
        pagina,
        count=1,
        flags=re.DOTALL | re.IGNORECASE
    )

    meta_social = crea_meta_social(
        titolo,
        descrizione,
        immagine,
        url
    )

    contenuto_id_js = json.dumps(
        str(contenuto_id),
        ensure_ascii=False
    )

    bootstrap = f"""
    <base href="{BASE_URL}/">

{meta_social}

    <script>
        window.CORRIERE_TEATRALE_PERMALINK_ID =
            {contenuto_id_js};

        const parametroOriginalePermalink =
            URLSearchParams.prototype.get;

        URLSearchParams.prototype.get = function(nome) {{

            if (
                nome === "id" &&
                window.CORRIERE_TEATRALE_PERMALINK_ID
            ) {{
                return window.CORRIERE_TEATRALE_PERMALINK_ID;
            }}

            return parametroOriginalePermalink.call(
                this,
                nome
            );
        }};
    </script>
"""

    pagina = re.sub(
        r"<head([^>]*)>",
        lambda match: match.group(0) + "\n" + bootstrap,
        pagina,
        count=1,
        flags=re.IGNORECASE
    )

    return pagina

def genera_pagina_evento(evento):
    """Genera la pagina permalink di uno spettacolo."""

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

    if not titolo:
        titolo = "Spettacolo"

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


def genera_pagina_notizia(
    notizia,
    template_html
):
    """Genera il permalink statico di una notizia."""

    notizia_id = str(
        notizia.get(
            "id",
            ""
        )
    ).strip()

    if not notizia_id:
        return None

    titolo = str(
        notizia.get(
            "titolo",
            "Notizia"
        )
    ).strip()

    if not titolo:
        titolo = "Notizia"

    descrizione = pulisci_markdown(
        notizia.get(
            "sommario",
            ""
        )
    )

    if not descrizione:
        descrizione = pulisci_markdown(
            notizia.get(
                "occhiello",
                ""
            )
        )

    if not descrizione:
        descrizione = pulisci_markdown(
            notizia.get(
                "testo",
                ""
            )
        )

    if not descrizione:
        descrizione = (
            "Notizie e approfondimenti "
            "dal teatro amatoriale romano."
        )

    immagine_markdown = (
        prima_immagine_markdown(
            notizia.get(
                "testo",
                ""
            )
        )
    )

    immagine = determina_immagine(
        notizia.get(
            "immagine",
            ""
        )
        or immagine_markdown
    )

    url = (
        f"{BASE_URL}/notizie/"
        f"{notizia_id}/"
    )

    pagina = prepara_template(
        template_html=template_html,
        titolo=titolo,
        descrizione=descrizione,
        immagine=immagine,
        url=url,
        contenuto_id=notizia_id
    )

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


def genera_pagina_intervista(
    intervista,
    template_html
):
    """Genera il permalink statico di un'intervista."""

    intervista_id = str(
        intervista.get(
            "id",
            ""
        )
    ).strip()

    if not intervista_id:
        return None

    titolo = str(
        intervista.get(
            "titolo",
            "Intervista"
        )
    ).strip()

    if not titolo:
        titolo = "Intervista"

    descrizione = pulisci_markdown(
        intervista.get(
            "introduzione",
            ""
        )
    )

    if not descrizione:

        intervistato = str(
            intervista.get(
                "intervistato",
                ""
            )
        ).strip()

        if intervistato:
            descrizione = (
                f"Intervista a {intervistato} "
                "su Corriere Teatrale."
            )

        else:
            descrizione = (
                "Le interviste di Corriere Teatrale "
                "ai protagonisti del teatro "
                "amatoriale romano."
            )

    immagine = determina_immagine(
        intervista.get(
            "immagine",
            ""
        )
    )

    url = (
        f"{BASE_URL}/interviste/"
        f"{intervista_id}/"
    )

    pagina = prepara_template(
        template_html=template_html,
        titolo=titolo,
        descrizione=descrizione,
        immagine=immagine,
        url=url,
        contenuto_id=intervista_id
    )

    destinazione = (
        CARTELLA_PAGINE_INTERVISTE /
        intervista_id
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
        f"Generata pagina intervista: {file_html}"
    )

    return file_html

def leggi_json(file_json):
    """Legge un singolo file JSON e restituisce il contenuto."""

    try:

        with file_json.open(
            "r",
            encoding="utf-8"
        ) as file:

            return json.load(file)

    except Exception as errore:

        print(
            f"Errore nella lettura di {file_json}: "
            f"{errore}"
        )

        return None


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

        evento = leggi_json(
            file_json
        )

        if not isinstance(
            evento,
            dict
        ):
            continue

        if evento.get("pubblicato") is not True:
            continue

        if not evento.get("id"):
            continue

        if genera_pagina_evento(
            evento
        ):
            numero_generate += 1

    print(
        f"Pagine spettacoli generate: "
        f"{numero_generate}"
    )

    return numero_generate


def genera_notizie():
    """Genera tutti i permalink delle notizie pubblicate."""

    if not CARTELLA_NOTIZIE.exists():

        print(
            "La cartella data/notizie non esiste."
        )

        return 0

    if not TEMPLATE_NOTIZIA.exists():

        print(
            "Il file notizia.html non esiste."
        )

        return 0

    template_html = (
        TEMPLATE_NOTIZIA.read_text(
            encoding="utf-8"
        )
    )

    CARTELLA_PAGINE_NOTIZIE.mkdir(
        parents=True,
        exist_ok=True
    )

    numero_generate = 0

    for file_json in sorted(
        CARTELLA_NOTIZIE.glob("*.json")
    ):

        notizia = leggi_json(
            file_json
        )

        if not isinstance(
            notizia,
            dict
        ):
            continue

        if notizia.get("pubblicato") is not True:
            continue

        if not notizia.get("id"):
            continue

        if genera_pagina_notizia(
            notizia,
            template_html
        ):
            numero_generate += 1

    print(
        f"Pagine notizie generate: "
        f"{numero_generate}"
    )

    return numero_generate


def genera_interviste():
    """Genera tutti i permalink delle interviste pubblicate."""

    if not CARTELLA_INTERVISTE.exists():

        print(
            "La cartella data/interviste non esiste."
        )

        return 0

    if not TEMPLATE_INTERVISTA.exists():

        print(
            "Il file intervista.html non esiste."
        )

        return 0

    template_html = (
        TEMPLATE_INTERVISTA.read_text(
            encoding="utf-8"
        )
    )

    CARTELLA_PAGINE_INTERVISTE.mkdir(
        parents=True,
        exist_ok=True
    )

    numero_generate = 0

    for file_json in sorted(
        CARTELLA_INTERVISTE.glob("*.json")
    ):

        intervista = leggi_json(
            file_json
        )

        if not isinstance(
            intervista,
            dict
        ):
            continue

        if intervista.get("pubblicato") is not True:
            continue

        if not intervista.get("id"):
            continue

        if genera_pagina_intervista(
            intervista,
            template_html
        ):
            numero_generate += 1

    print(
        f"Pagine interviste generate: "
        f"{numero_generate}"
    )

    return numero_generate


def main():
    """Genera tutti i permalink statici del sito."""

    print(
        "Avvio generazione pagine Corriere Teatrale..."
    )

    spettacoli = genera_spettacoli()

    notizie = genera_notizie()

    interviste = genera_interviste()

    print(
        "Generazione completata."
    )

    print(
        f"Spettacoli: {spettacoli}"
    )

    print(
        f"Notizie: {notizie}"
    )

    print(
        f"Interviste: {interviste}"
    )


if __name__ == "__main__":
    main()
