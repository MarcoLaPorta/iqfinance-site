# IQ Finance — sito (iqfinance-site)

Sito statico pubblicato con GitHub Pages: **ciò che arriva su `main` va online.**

## Lingue

- **L'inglese è la versione ufficiale del sito; l'italiano è la traduzione.**
- Struttura: `index.html` = inglese (indirizzo principale), `it/index.html` = italiano,
  `en/index.html` = reindirizzamento alla radice (vecchio indirizzo dell'inglese).
- Ogni contenuto nuovo si scrive prima in inglese. Si traduce in italiano solo dopo
  l'approvazione di Marco sul testo inglese.
- Ogni correzione di fatti va applicata a entrambe le lingue nello stesso commit.

## Regole

1. **Main e push.** Su `main` si unisce e si fa push solo dopo approvazione esplicita di Marco.
   Push su `main` = sito online. Si lavora su branch (es. `redesign/sito-chiaro`).
2. **Fonte dei fatti.** Ogni numero e ogni stato di funzionalità viene da
   `~/Desktop/IQF/iqfinance-docs/facts.yaml` (sola lettura: non modificarlo).
   Valori `da_verificare`, `DA_VERIFICARE`, `DA_DECIDERE`, `DA_RICOSTRUIRE` non si pubblicano.
3. **Linguaggio semplice nella home, in entrambe le lingue.** Niente gergo: RWA (real-world
   assets), DSR (Deflated Sharpe), backstop, keeper, EIP, MEV, non-custodial (senza spiegazione).
   Il contenuto tecnico sta nella pagina **Tecnologia** / **Technology**.
4. **Niente presente su ciò che non esiste.** Ciò che in `facts.yaml` ha stato `futuro` o
   `in_sviluppo` non si descrive al presente: mandato firmato una volta, monitoraggio del rischio
   dopo l'esecuzione, ribilanciamento automatico, token che seguono il prezzo del sottostante
   (oggi i token testnet sono emessi e riscattati alla pari con USDC).
5. **Prezzi.** Si pubblicano solo i due piani, al futuro ("at launch"), IVA inclusa:
   Pro € 20 al mese e Pro Max € 85 al mese (da `facts.yaml`), senza il numero di token inclusi.
   I token di utilizzo extra si descrivono come utility token nel wallet dell'utente (stato:
   futuro), senza prezzo. Niente performance fee, margini sugli ordini, listino in token o
   prezzo dei token extra.
6. **Immagini.** Le immagini del prodotto sono disegnate in HTML/CSS sul design v2
   (`design-reference/`), con didascalia "Product design preview · illustrative figures".
   I numeri delle strategie sono illustrativi ("Illustrative figures") e vanno sostituiti con i
   backtest reali prima del push. Screenshot reali dell'MVP: didascalia
   "Screenshot of the MVP on a test network · simulated results".
7. **Riepilogo finale** di ogni lavoro con tutti i commit (hash e contenuto).

## Controllo prima del push

Hook versionato in `.githooks/pre-push` (solo Python standard, nessuna dipendenza).
Blocca il push se:
- nel sito restano segnaposto `[[`;
- l'HTML non è valido (tag non chiusi o chiusi male, id duplicati);
- un'immagine referenziata (img, srcset, icone, og:image, url() nel CSS) non esiste nella cartella;
- compaiono parole vietate nella home (`index.html`, `en/index.html`, `it/index.html`),
  elencate in `.githooks/parole-vietate.txt` (italiano e inglese).

Attivazione, una volta per ogni clone:

```sh
git config core.hooksPath .githooks
```

Controllo manuale: `python3 .githooks/check_site.py`.

`CLAUDE.md` è escluso dalla pubblicazione tramite `_config.yml` (Jekyll di GitHub Pages).
