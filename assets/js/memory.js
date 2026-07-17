const memory = document.getElementById("memory-bg");

const ops = [
    "48 89 5C 24 08",
    "48 83 EC 20",
    "48 8B D9",
    "FF 15 8A 10 00 00",
    "E8 44 12 00 00",
    "85 C0",
    "74 11",
    "75 05",
    "48 8D 4C 24 30",
    "90",
    "CC",
    "31 C0"
];

let output = "";

for (let i = 0; i < 45; i++) {

    let address =
        "0x00007FF6" +
        (0x200000 + i * 16)
        .toString(16)
        .toUpperCase();

    output += `<div>
        <span class="mem-address">${address}</span>
        `;

    let bytes = [];

    while(bytes.length < 16){

        let chance = Math.random();

if (chance < 0.65) {

    bytes.push("00");

}
else if (chance < 0.85) {

    bytes.push(
        ops[Math.floor(Math.random()*ops.length)]
    );

}
else {

    bytes.push(
        ["CC","FF","E8","48","8B","90"]
        [Math.floor(Math.random()*6)]
    );

}
    }

    bytes = bytes.join(" ").split(" ");

    bytes.forEach(byte => {

        let cls = "zero";

        if (byte === "00") {

    cls = "zero";

}
else if (
    ["CC","FF","E8","90"].includes(byte)
) {

    cls = "red";

}
else {

    cls = "green";

}

        output += `<span class="${cls}">${byte}</span> `;
    });

    output += "</div>";
}

memory.innerHTML = output;
