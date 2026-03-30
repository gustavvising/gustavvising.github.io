---
layout: post
title: "Hur jag hittade en Broken Access Control i en svensk elbilstjänst"
date: 2026-03-30
---

Det här är historien om hur jag hittade en *Broken Access Control-sårbarhet* som gjorde det möjligt
att avboka godtyckliga bokningar i en svensk elbilstjänst. I praktiken innebar det att vem som helst kunde avboka andras bokningar.

Först ville jag förstå hur systemet kommunicerade med fordonen och med backend.
Tjänsten använde en app för att hyra och låsa upp deras bilar. För att identifiera och komma åt API:et
var det snabbaste sättet att reverse engineera APK:en. När jag hade öppnat APK:en i ett dekompileringsverktyg såg
jag att appen använde React och hade minimalt med synlig kod. Detta berodde på att appen använde Hermes
och själva koden fanns kompilerad i en fil som hette *index.android.bundle*. 
<br>
<br>
![Dekompilering av bundle-filen](/assets/images/hbc_disasm_av_bundle.png)
*Dekompilering av index.android.bundle.*
<br>
<br>
Efter dekompilering fick jag ut en hasm-fil. Den började jag reverse engineera.
Då upptäckte jag att appen kommunicerade över GraphQL. Efter lite mer trixande fick jag fram ett strukturerat schema
över queries och mutations i API:et.

Jag testade mig fram och ganska snart dök något upp. En mutation som hette `deleteBooking` gav inte
**unauthorized** som de flesta övriga funktioner gjorde. Jag tänkte direkt *"tänk om det finns en broken access control här..."*.

Men för att det skulle vara en konkret risk behövdes andra personers boknings-ID:n.
För att få en större attackyta skapade jag en legitim session via BankID.
Jag upptäckte mutationerna `authBankID`, `authenticate` och satte ihop ett Python-skript för att automatisera processen.
Först anropade jag `authBankID` för att få `autoStartToken` och sedan pollade jag `authenticate` en gång i sekunden tills
en inloggning bekräftades via BankID-appen med `autoStartToken`.

Beväpnad med en giltig session kunde jag utforska fler funktioner i systemet.
Härifrån kunde jag lista alla platser och deras fordon. Därefter kunde jag hämta bokningar för fordon
genom `getBookingsForCar`.
<br>
<br>
![Boknings-ID:n listade via query](/assets/images/bookings.jpg)
*Boknings-ID:n för ett fordon listade.*
<br>
<br>
Jag testade att skapa en ny bokning och loggade sedan ut. Placerade boknings-ID:et i `deleteBooking`, tryckte på kör — och den försvann!
Jag hade hittat en Broken Access Control!

Om sårbarheten hade utnyttjats så hade vem som helst kunnat avboka alla bokningar i systemet. Det hade kunnat stoppat deras intäkter och
strandsatt användare som redan var ute. Jag kontaktade företaget för att göra responsible disclosure. Jag fick kontakt med deras CTO och de gav ersättning för buggen.
De lyckades täppa till sårbarheten och tackade. Ju mer skyddat ett API ser ut, desto mer sällan kollar man vad som valideras.
<br>
<br>
<br>
<br>
