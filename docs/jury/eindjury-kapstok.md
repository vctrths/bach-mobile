# Eindjury kapstok - Groene Vingers

Doel: een scherpe vertrekbasis voor je design jury en development jury. Gebruik dit als spreektekst, checklist en slide-inhoud. De toon mag menselijk en persoonlijk blijven: jij verdedigt niet alleen schermen, maar vooral waarom deze interacties logisch zijn voor tuineigenaars en tuinzoekers.

Figma:
[Bachelorproef individueel](https://www.figma.com/design/dBda0NPCtoUabopUVjNaYr/Bachelorproef--individueel-?node-id=3001-1215&m=dev)

## Kernboodschap

Groene Vingers verlaagt de drempel om ongebruikte tuinen en gemotiveerde tuinzoekers met elkaar te verbinden. Het MVP focust op vertrouwen, duidelijke afspraken en een begeleide aanvraagflow: van tuin ontdekken, naar detail bekijken, aanvraag sturen, goedkeuren en daarna communiceren.

## Leerdoelen expliciet benoemen

Leerdoel 5: Prototypeontwikkeling en interactieontwerp
Ik toon hoe mijn hifi-prototype opgebouwd is vanuit rollen, user stories en herkenbare mobiele design patterns. De belangrijkste interactie is niet alleen "een tuin zoeken", maar het volledige beslissingsmoment: ontdekken, beoordelen, aanvragen en opvolgen.

Leerdoel 9: Effectieve mondelinge communicatie
Ik structureer de demo voor twee publieken: bij de design jury focus ik op keuzes, flows, toegankelijkheid en prototypegedrag; bij de development jury focus ik op de geïmplementeerde core feature, technische haalbaarheid en trade-offs.

## Design jury - 20 minuten

### Timing

0:00-0:30 - Context
Groene Vingers is een app voor twee doelgroepen: tuineigenaars met beschikbare tuinruimte en tuinzoekers die willen tuinieren maar geen eigen tuin hebben.

0:30-1:00 - MVP-focus
Voor het MVP heb ik bewust gekozen voor de matching- en aanvraagflow. Die flow bewijst de kernwaarde van het product: van interesse naar concrete samenwerking.

1:00-5:00 - Live demo in Figma preview
Toon alleen de belangrijkste flow. Vermijd een volledige tour langs alle schermen.

5:00-20:00 - Vragenronde
Gebruik de Q&A-blokken verderop als ankers.

### Demo flow in Figma preview

1. Start bij de rol/context
Zeg: "Ik toon de flow vanuit een tuinzoeker, omdat daar het meeste onzekerheid en beslissingsgedrag zit."

2. Dashboard / ontdekken
Toon: zoekbalk, tuincards, visuele informatie, bottom navigation.
Designkeuze: de gebruiker krijgt snel scanbare tuinen in plaats van lange lijsten. Foto, locatie, rating en voorzieningen helpen bij snelle eerste selectie.

3. Tuindetail
Toon: foto-carousel, beschrijving, locatiekaart, voorzieningen en eigenaarcontext.
Designkeuze: voor een aanvraag moet de gebruiker genoeg vertrouwen krijgen. Daarom staan sfeerbeeld, locatie, praktische info en beschikbaarheid dicht bij elkaar.

4. Aanvraag sturen
Toon: motivatie, samenwerkingstype, dagen, startdatum, validatie.
Designkeuze: het formulier is bewust gestructureerd als afspraakvorming. De gebruiker schrijft niet alleen "ik wil meedoen", maar maakt meteen verwachtingen expliciet.

5. Tuineigenaar perspectief
Toon: owner dashboard, aanvragen, planning en notificaties.
Designkeuze: dezelfde samenwerking wordt gespiegeld naar de eigenaar. Die krijgt niet alleen een melding, maar ook informatie om een veilige beslissing te nemen.

6. Chat / opvolging
Toon: berichten of gesprek als vervolg op een aanvraag.
Designkeuze: na goedkeuring verschuift de app van ontdekken naar afstemmen. Chat maakt de samenwerking concreet zonder de flow te onderbreken.

### Slide-opbouw voor design jury

Slide 1 - Titel
Groene Vingers: van ongebruikte tuin naar gedeelde groene ruimte.

Slide 2 - Probleem en doelgroep
Twee gebruikers met verschillende onzekerheden:
tuinzoeker zoekt toegang, vertrouwen en duidelijke afspraken;
tuineigenaar zoekt betrouwbaarheid, controle en overzicht.

Slide 3 - MVP-keuze
Core journey: tuin ontdekken -> detail bekijken -> aanvraag sturen -> eigenaar beslist -> chat/opvolging.
Leg uit dat deze flow het kleinste product is dat de waarde van Groene Vingers bewijst.

Slide 4 - Interactiemodel
Toon de flow als vijf stappen. Benoem dat de navigatie rolgebaseerd is: tuinzoeker, tuineigenaar en tuinzoeker met actieve tuin.

Slide 5 - Design system
Gebruik de Figma tokens:
green-50 `#F5FFF3`, green-100 `#EAF0D8`, green-200 `#D4E1AE`, green-500 `#698D14`, green-600 `#173300`, green-700 `#172211`.
Zeg: "Het groene palet is functioneel: rust en vertrouwen voor basisinteracties, donker groen voor primaire acties, geel/rood alleen voor informatie of waarschuwing."

Slide 6 - Patterns
Toon topnav, botnav, cards, status/profile indicators, buttons en planning.
Benoem: herkenbare mobiele patronen verlagen de leercurve; cards maken tuinen vergelijkbaar; pill navigatie houdt acties dicht bij duimgebruik.

Slide 7 - Prototype-interacties
Benoem klikbare states: onboarding/rol, zoeken, detail, aanvraag, eigenaarbeslissing, chat.
Zeg: "Het prototype is niet enkel visueel; het simuleert de beslissingsmomenten in de journey."

Slide 8 - Validatie en iteratie
Vertel wat je sinds maart licht hebt aangescherpt:
meer consistente componenten, duidelijkere rolflows, sterker onderscheid tussen ontdekken en beheren, betere aanvraagstructuur.
Pas dit aan aan wat echt veranderd is in jouw Figma.

Slide 9 - Demo cue
Een bijna lege slide met "Live demo" en de core journey. Laat de slide dienen als brug naar Figma preview.

Slide 10 - Afsluiter
Herhaal: "De kracht van het MVP zit in een betrouwbare eerste samenwerking, niet in zoveel mogelijk features."

## Development jury - 20 minuten

### Core feature demo

Demo als technisch verhaal:
1. Login/session bepaalt rol.
2. Dashboard rendert per rol een andere view.
3. Tuinzoeker zoekt of ontdekt tuinen via Supabase.
4. Detailpagina haalt tuin + eigenaarinformatie op.
5. Aanvraagformulier valideert met Zod.
6. Insert in `garden_requests`.
7. Conversatie wordt gezocht of aangemaakt.
8. Eerste bericht wordt automatisch aangemaakt.
9. Owner kan aanvragen beheren en goedkeuren/afwijzen.

### Technische talking points

Expo Router:
File-based routing met dynamische routes zoals `/garden/[id]`, `/garden/[id]/request` en `/messages/[id]`.

Tamagui:
Consistente UI-componenten en theming. Componenten zoals `PageContainer`, `TopNavPill`, `BottomNav`, `GardenCard` en `Button` vertalen het Figma design system naar code.

Supabase:
Auth, tabellen voor profiles/gardens/garden_requests/conversations/messages en RLS als basis voor data ownership.

Validatie:
Zod bewaakt motivatie, samenwerkingstype, dagen en startdatum voor de aanvraagflow.

Cross-platform:
iOS, Android en web via Expo. Web heeft enkele platformbeperkingen, maar de core journey blijft bruikbaar.

## Mogelijke juryvragen en antwoorden

Waarom heb je deze flow als MVP gekozen?
Omdat de aanvraagflow de kernwaarde bewijst. Als gebruikers veilig een tuin kunnen vinden, aanvragen en opvolgen, is het concept gevalideerd.

Waarom twee rollen?
Omdat de noden fundamenteel verschillen. Een tuinzoeker wil ontdekken en aanvragen; een eigenaar wil beheren, beoordelen en overzicht houden.

Waarom cards?
Cards zijn geschikt voor vergelijkbare objecten met foto, locatie, rating en korte metadata. Ze ondersteunen snel scannen op mobiel.

Waarom zoveel groen?
Het palet sluit aan bij de inhoud, maar is ook functioneel: zachte groenen voor rust, donker groen voor primaire acties, semantische kleuren voor status.

Hoe toon je vertrouwen?
Via profielinformatie, rating, locatie, duidelijke voorzieningen, motivatie bij aanvraag en chat als vervolgkanaal.

Wat is sinds maart licht veranderd?
Gebruik hier je echte antwoord. Mogelijke formulering: "De structuur is grotendeels behouden, maar ik heb de rolflows en componentconsistentie verfijnd zodat het prototype beter aansluit op het MVP."

Wat zou je later toevoegen?
Betere reviewflow, kalenderintegratie, notificatievoorkeuren, moderatie/rapporteren, uitgebreid onboardingadvies en meer owner tools.

Wat is de grootste technische uitdaging?
De rolgebaseerde flow consistent houden over routes, data en UI-states, zeker wanneer een tuinzoeker later een actieve samenwerking heeft.

## Korte pitch in Nederlands

Groene Vingers verbindt mensen die willen tuinieren met eigenaars die tuinruimte beschikbaar hebben. Mijn MVP focust op de eerste betrouwbare samenwerking: een tuinzoeker ontdekt een tuin, bekijkt praktische informatie, stuurt een duidelijke aanvraag en kan daarna met de eigenaar communiceren. In mijn design heb ik gekozen voor herkenbare mobiele patronen, een rustig groen design system en rolgebaseerde flows, zodat beide doelgroepen snel begrijpen wat ze kunnen doen en waarom.

## Short pitch in English

Groene Vingers connects people who want to garden with owners who have available garden space. My MVP focuses on the first trusted collaboration: discovering a garden, checking practical details, sending a structured request and continuing the conversation afterwards. The design uses familiar mobile patterns, a calm green design system and role-based flows so both user groups understand their next action quickly.

## Laatste voorbereidingschecklist

- Open Figma preview op de juiste startflow.
- Zet de browser op volledig scherm.
- Oefen de demo op 4 minuten zodat je marge hebt.
- Benoem leerdoel 5 voor je de interacties toont.
- Benoem leerdoel 9 in je intro of afsluiter.
- Bereid een kort antwoord voor op "wat is je MVP en wat niet?"
- Noteer exact welke wijzigingen sinds maart licht zijn aangepast.
- Zorg dat je live demo niet afhankelijk is van internet behalve Figma zelf.
