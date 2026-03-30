---
layout: post
title: "Hur jag hittade en Broken Access Control i en svensk elbilstjänst"
date: 2026-03-30
---

Det här är historien om hur jag hittade en *Broken Access Control-sårbarhet* som gjorde det möjligt
att avboka godtyckliga bokningar i en svensk elbilstjänst.


Först ville jag ta reda på hur systemet kommunicerade med fordon och förstå hur klienten kommunicerade med backend.
Tjänsten använde sig av en app för att hyra och låsa upp deras bilar. För att identifiera och komma åt API:et
var det snabbaste sättet att reverse engineera APK:en. När jag hade öppnat APK:en i ett dekompileringsverktyg så kunde
jag se att appen använde sig av React och hade minimalt med synlig kod. Detta berodde på att appen använde sig av Hermes
och själva koden fanns kompilerad i en fil som hette *index.android.bundle* i mappen *assets*. 



![Dekompilering av bundle filen](/assets/images/hbc_disasm_av_bundle.png)



Efter att verktyget dekompilerat filen fick jag ut en .hasm fil som jag kunde börja reverse engineera.
Det ledde till att jag upptäckte att appen kommunicerar över GraphQL som API. Efter ytterligare trixande och
olika former av reversing hade jag kommit fram till ett strukturerat schema av queries och mutations som
utgjorde API:et.


Jag började då prova mig fram och upptäckte något intressant. En mutation som hette `deleteBooking` gav inte
unauthorized som de flesta övriga funktioner. Jag tänkte direkt *"tänk om det finns en broken access control här..."*.


Men för att det skulle vara en konkret risk så måste det gå att få tag på bokningsidnummer.
För att få större attackyta valde jag att skapa en legitim session via bankid.
Upptäckte mutationerna `authBankID`, `authenticate` och satte ihop ett pythonskript för att automatisera processen.
Först kalla `authBankID` för att få `autoStartToken` och sedan polla `authenticate` en gång i sekunden tills
en inloggning gjorts via bankidappen med `autoStartToken`.


Beväpnad med en giltig session hade jag nu tillgång till de funktioner som krävde inloggning.
Härifrån kunde jag lista alla platser och deras fordon. Därefter kunde jag få fram bokningarna för fordon
genom `getBookingsForCar`!



![Bokningsnummer listade via query](/assets/images/bookings.jpg)



Provade att skapa en ny bokning och loggade sedan ut. Satte in bokningsid i `deleteBooking` och ...
Bokningen raderades!


Om någon utnyttjade sårbarheten hade de kunnat avboka alla bokningar och på så sätt hindrat intäkter till företaget och
ställt till det för användarna. Jag kontaktade företaget för att göra responsible disclosure. Fick kontakt med deras CTO och de gav ersättning för buggen.
De lyckades täppa till sårbarheten och tackade. Det hela var väldigt lärorikt och jag utvecklade min förmåga att genomföra pentests
och framförallt att hitta buggar i GraphQL API:er samt att kommunicera med företag.

