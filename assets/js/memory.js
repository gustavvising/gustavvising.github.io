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

const totalRows = 300;
const bytesPerRow = Math.ceil(window.innerWidth / 8);

for (let i = 0; i < totalRows; i++) {

    const address =
        "0x00007FF6" +
        (0x200000 + i * 16)
            .toString(16)
            .toUpperCase();

    output += `<div><span class="mem-address">${address}</span> `;

    let bytes = [];

    while (bytes.length < bytesPerRow) {

        const chance = Math.random();

        if (chance < 0.55) {

            bytes.push("00");

        }
        else if (chance < 0.73) {

            const instruction =
                ops[Math.floor(Math.random() * ops.length)];

            bytes.push(...instruction.split(" "));

        }
        else if (chance < 0.76) {

            bytes.push("??");

        }
        else {

            bytes.push(
                ["CC", "FF", "E8", "90"][
                    Math.floor(Math.random() * 4)
                ]
            );
        }
    }

    bytes = bytes.slice(0, bytesPerRow);

    bytes.forEach(byte => {

        let cls = "green";

        if (byte === "00") {
            cls = "zero";
        }
        else if (["CC", "FF", "E8", "90"].includes(byte)) {
            cls = "red";
        }
        else if (byte === "??") {
            cls = "unknown";
        }

        output += `<span class="${cls}">${byte}</span> `;
    });

    output += `</div>`;
}

memory.innerHTML = output;
