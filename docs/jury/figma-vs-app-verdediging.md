# Figma vs app - verdedigingslijst design jury

Deze lijst is bedoeld om voorbereid te zijn op de vraag: "Waar verschilt je huidige prototype/app van je Figma en waarom?" Gebruik dit niet als excuuslijst, maar als bewijs dat je bewust keuzes hebt gemaakt.

## Korte hoofdzin

"De Figma is mijn high-fidelity designbasis. In de implementatie heb ik sommige zaken licht aangepast om de MVP-flow scherper, technisch haalbaar en rolgerichter te maken. De kernjourney blijft dezelfde: ontdekken, vertrouwen opbouwen, aanvraag sturen, eigenaar beslist en opvolging via chat/planning."

## Belangrijkste verschillen die je kan verdedigen

### 1. Owner dashboard is meer beheergericht in de app

Figma:
Het frame `Tuineigenaar - Dashboard` toont bovenaan een locatieblok met zoekbalk en daarna tuincards + planning.

App:
De owner dashboard toont vooral beheer: eigen tuinen, tuin toevoegen, planning, actieve samenwerkingen en openstaande aanvragen.

Waarom verdedigbaar:
Voor het MVP is de tuineigenaar minder bezig met "zoeken" en meer met "beheren". De implementatie maakt de rol dus scherper: de tuinzoeker ontdekt, de eigenaar beheert.

Zeg dit:
"In Figma zat het dashboard nog dichter bij een algemene ontdekervaring. Tijdens de uitwerking heb ik de owner-flow aangescherpt: voor een tuineigenaar is overzicht en controle belangrijker dan zoeken. Daarom toont de app meer beheerblokken zoals aanvragen, samenwerkingen en planning."

### 2. Bottom navigation heeft extra rolvarianten in de app

Figma:
De botnav-component heeft varianten zoals `tuinzoeker`, `tuinzoeker met tuin` en `tuineigenaar`.

App:
De bottom nav is dynamisch. Afhankelijk van de rol verandert de shortcut:
tuinzoeker krijgt kaart,
tuinzoeker met tuin krijgt opvolgingen,
tuineigenaar krijgt tuin toevoegen.

Waarom verdedigbaar:
Dit is een functionele vertaling van de designvarianten. In plaats van statische varianten gebruikt de app rolgebaseerde navigatie.

Zeg dit:
"De Figma toont de navigatievarianten visueel. In code heb ik dat vertaald naar dynamische navigatie per rol, zodat dezelfde component zich aanpast aan de context van de gebruiker."

### 3. Enkele extra features bestaan in de app die niet overal even uitgewerkt zijn in Figma

Voorbeelden:
Kaart, opgeslagen tuinen, tuin aanmaken, opvolgingen/logboek, Pro-flow, notifications en owner request accepted/rejected screens.

Waarom verdedigbaar:
Niet elk extra scherm is deel van de design jury demo. De demo moet focussen op de MVP-core. Extra schermen tonen technische scope, maar zijn niet allemaal de kern van het hifi-verhaal.

Zeg dit:
"Ik toon tijdens de design jury bewust niet alle geïmplementeerde schermen. Sommige extra schermen ondersteunen de app technisch of functioneel, maar mijn designverhaal focust op de core journey die het MVP bewijst."

### 4. Settings-scherm is in app uitgebreid met Pro/account-acties

Figma:
Instellingen toont vooral Account en Meer, met persoonlijke gegevens, account verifiëren, notificaties, account verwijderen en uitloggen.

App:
Het settings-scherm bevat dezelfde basisstructuur, maar kan ook een Pro-upgradebanner tonen voor niet-owner gebruikers.

Waarom verdedigbaar:
Dit is een productbeslissing rond monetisatie en toegangscontrole. De basislayout blijft hetzelfde, maar de app toont contextuele informatie afhankelijk van de gebruiker.

Zeg dit:
"De instellingen zijn grotendeels gelijk gebleven, maar in de app komt er contextuele content bij, zoals Pro. Dat is niet bedoeld als redesign, maar als productlaag bovenop dezelfde settingsstructuur."

### 5. Kleurgebruik is grotendeels gelijk, maar sommige tussentinten wijken af

Figma tokens:
`green-50 #F5FFF3`, `green-100 #EAF0D8`, `green-200 #D4E1AE`, `green-500 #698D14`, `green-600 #173300`, `green-700 #172211`, `surface #FFFFFF`, `surface-tinted #E0E0E0`.

App:
De app gebruikt deze kernkleuren, maar ook praktische tussentinten zoals `#F1F3EC`, `#F0F3EC`, `#E3ECD7`, `#57594D`, `#37392B`.

Waarom verdedigbaar:
De app gebruikt extra UI-tinten voor borders, cards, muted tekst en states. Dat is normaal bij implementatie zolang de merktaal en semantiek behouden blijven.

Zeg dit:
"De basistokens komen uit Figma. In de app heb ik enkele tussentinten gebruikt voor states, borders en leesbaarheid. De semantiek blijft wel gelijk: donker groen voor primaire acties, lichte groenen voor oppervlakken en geel/rood voor status."

### 6. Border radius en cardstijl zijn soms ronder in code

Figma:
Veel schermcomponenten gebruiken zachte maar vrij strakke afgeronde hoeken; sommige cards en buttons zijn pill-shaped.

App:
Garden cards gebruiken bijvoorbeeld `borderRadius={16}`, list cards `20`, buttons vaak `64`, chat bubbles zeer rond.

Waarom verdedigbaar:
De app heeft touchvriendelijke componenten en herbruikbare UI-componenten. De ronde stijl ondersteunt het vriendelijke, toegankelijke karakter van de app.

Let op:
Als je jury heel strikt vraagt of dit exact uit Figma komt, zeg niet dat het pixel-perfect is. Zeg dat de app een consistente implementatievariant is.

Zeg dit:
"Ik heb niet geprobeerd om elk element pixel-perfect te reproduceren. Ik heb vooral de componentlogica, visuele taal en interactiepatronen behouden. Sommige radii zijn in code consistenter gemaakt voor herbruikbare touchcomponenten."

### 7. Tuincard-inhoud is functioneler geworden

Figma:
De tuincard toont foto, naam, locatie, rating, detailbutton en save/heart.

App:
De tuincard behoudt deze structuur, maar voegt/varieert met dynamische data, fallbackbeelden en amenity badges.

Waarom verdedigbaar:
De app moet omgaan met echte data en ontbrekende data. Figma toont ideale content; code moet ook lege of variabele content aankunnen.

Zeg dit:
"Figma toont de ideale card. In de app is de card robuuster gemaakt voor echte data: fallbackbeelden, ontbrekende ratings en voorzieningen worden opgevangen."

### 8. Aanvraagflow is technisch concreter dan in Figma

Figma:
De aanvraagflow toont de interactie en velden.

App:
De aanvraagflow bevat validatie, premium-check, eigen-tuin-check, duplicate-request-check, Supabase insert, gesprek aanmaken en automatisch eerste bericht.

Waarom verdedigbaar:
Dit is een sterke afwijking om te verdedigen: je hebt de hifi-flow vertaald naar echte interactielogica.

Zeg dit:
"In Figma toon ik de aanvraag als interactie. In de app is dat uitgewerkt als echte flow met validatie en vervolgactie. Dat versterkt het MVP, omdat de aanvraag niet stopt bij een button maar meteen leidt naar communicatie."

### 9. Web/native technische beperkingen veroorzaken kleine verschillen

Voorbeelden:
Date picker werkt anders op web dan native, blur heeft platformverschillen, beeldselectie en maps hebben aparte web/native implementaties.

Waarom verdedigbaar:
Expo is cross-platform. Sommige componenten moeten per platform aangepast worden.

Zeg dit:
"Omdat dit een Expo-app is, zijn sommige componenten platformafhankelijk. Ik heb geprobeerd de interactielogica gelijk te houden, ook als de exacte native component op web anders werkt."

## Wat je best niet zegt

- "Ik had geen tijd, dus het wijkt af."
- "De code klopt niet met Figma."
- "Dat scherm is eigenlijk niet belangrijk."
- "Ik weet niet waarom dat anders is."

## Wat je wel zegt

- "Ik heb de core journey behouden."
- "De implementatie is rolgerichter geworden."
- "Sommige verschillen zijn technische vertalingen van hifi naar werkende app."
- "Figma toont de ideale visuele staat; de app moet ook echte data en edge cases ondersteunen."
- "Voor de design jury focus ik op de interactiemodellen en designkeuzes, niet op pixel-perfect parity."

## Als ze vragen: wat is licht gewijzigd sinds maart?

Gebruik dit antwoord:

"Sinds maart heb ik geen volledig nieuw concept gemaakt. De kern is behouden: tuinzoeker en tuineigenaar verbinden via een aanvraagflow. De wijzigingen zitten vooral in verfijning: duidelijkere rolflows, consistentere componenten, een concretere aanvraagflow en betere opvolging via planning, meldingen en chat."

## Als ze vragen: wat is de grootste afwijking?

Gebruik dit antwoord:

"De grootste inhoudelijke verschuiving is dat de app de tuineigenaar sterker als beheerrol behandelt. In Figma zat het owner dashboard nog dichter bij een algemene dashboardervaring. In de app heb ik dat scherper gemaakt, omdat de eigenaar vooral controle, aanvragen en planning nodig heeft."

## Snelle tabel

| Onderdeel | Figma | App | Verdediging |
|---|---|---|---|
| Owner dashboard | Locatie/search + tuinen + planning | Beheer: tuinen, aanvragen, samenwerkingen, planning | Rol scherper gemaakt |
| Bottom nav | Visuele varianten per rol | Dynamische shortcut per rol | Figma-variant vertaald naar echte logica |
| Settings | Account + Meer | Account + Meer + contextuele Pro-banner | Productlaag, geen nieuw concept |
| Kleuren | Strikte tokens | Tokens + extra implementatietinten | States, borders en leesbaarheid |
| Cards | Ideale content | Dynamische/fallback content | Echte data en edge cases |
| Aanvraag | Prototype-interactie | Validatie + database + chat | MVP technisch concreter |
| Extra schermen | Niet overal volledig zichtbaar | Map, saved, logbook, Pro, create garden | Ondersteunend, niet allemaal demo-core |

## Demo-advies

Toon niet eerst de verschillen. Toon eerst de core journey alsof die klopt, want die klopt conceptueel. Als de jury vraagt naar afwijkingen, gebruik bovenstaande als rustige verdediging.

Sterke afsluitzin:
"De Figma blijft mijn ontwerpbron, maar de app is de MVP-vertaling ervan. Daardoor zijn sommige keuzes pragmatischer, vooral rond rolgedrag, echte data en technische interacties."
