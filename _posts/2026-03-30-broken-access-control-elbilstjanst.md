---
layout: post
title: "Hur jag hittade en Broken Access Control i en svensk elbilstjänst"
date: 2026-03-30
---

Det här är historien om hur jag hittade en *Broken Access Control-sårbarhet* som gjorde det möjligt
att avboka godtyckliga bokningar i en svensk elbilstjänst. I praktiken innebar det att vem som helst kunde avboka andras bokningar.


Först ville jag förstå hur systemet kommunicerade med fordonen och med backend.
Tjänsten använde en app för att hyra och låsa upp deras bilar. För att identifiera och komma åt API:et
var det snabbaste sättet att reverse engineera APK:en. När jag hade öppnat APK:en i ett dekompileringsverktyg så kunde
jag se att appen använde React och hade minimalt med synlig kod. Detta berodde på att appen använde Hermes
och själva koden fanns kompilerad i en fil som hette *index.android.bundle* i mappen *assets*. 



![Dekompilering av bundle-filen](/assets/images/hbc_disasm_av_bundle.png)



Efter dekompilering fick jag ut en .hasm-fil. Den började jag reverse engineera.
Då upptäckte jag att appen kommunicerade över GraphQL. Efter lite mer trixande fick jag fram ett strukturerat schema
över queries och mutations i API:et.


Jag testade mig fram och ganska snart dök något upp. En mutation som hette `deleteBooking` gav inte
unauthorized som de flesta övriga funktioner gjorde. Jag tänkte direkt *"tänk om det finns en broken access control här..."*.


Men för att det skulle vara en konkret risk så måste det gå att få tag på boknings-ID:n.
För att få större attackyta valde jag att skapa en legitim session via BankID.
Jag upptäckte mutationerna `authBankID`, `authenticate` och satte ihop ett pythonskript för att automatisera processen.
Först anropade jag `authBankID` för att få `autoStartToken` och sedan pollade jag `authenticate` en gång i sekunden tills
en inloggning gjordes via BankID-appen med `autoStartToken`.


Beväpnad med en giltig session hade jag nu tillgång till de funktioner som krävde inloggning.
Härifrån kunde jag lista alla platser och deras fordon. Därefter kunde jag få fram bokningarna för fordon
genom `getBookingsForCar`!



![Boknings-ID:n listade via query](/assets/images/bookings.jpg)



Testade att skapa en ny bokning och loggade sedan ut. Placerade boknings-ID:et i `deleteBooking`, tryckte på kör — och den försvann!
Jag hade hittat en Broken Access Control!


Om någon utnyttjade sårbarheten hade vem som helst kunnat avboka alla bokningar i systemet. Det hade kunnat stoppa alla intäkter och
strandsätta användare som var ute. Jag kontaktade företaget för att göra responsible disclosure. Jag fick kontakt med deras CTO och de gav ersättning för buggen.
De lyckades täppa till sårbarheten och tackade. Väldigt lärorikt, särskilt kring GraphQL, access control och hur man faktiskt hittar den här typen av buggar.

