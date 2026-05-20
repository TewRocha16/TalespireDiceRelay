Hooks.once("ready", () => {

  console.log("talespire-dice | Initialized");

  let electronShell = null;

  try {
    electronShell = window.require("electron").shell;
    console.log("talespire-dice | Electron shell loaded");
  }
  catch (err) {
    console.error("talespire-dice | Could not load Electron shell", err);
  }

  Hooks.on("createChatMessage", (msg) => {

    if (!electronShell) return;

    const roll = msg.rolls?.[0];

    if (!roll) return;

    console.log("Foundry formula:", roll.formula);

    const formula = parseRollFormula(roll.formula);

    if (formula === "nodice") return;

    if (formula === "crit") {
      ui.notifications.error("Talespire doesn't support multiplication crit formulas.");
      return;
    }

    console.log("TaleSpire formula:", formula);

    electronShell.openExternal("talespire://dice/" + formula);

  });

});

function parseRollFormula(formula) {

  if (!formula) return "nodice";

  formula = formula.replace(/\s+/g, "");

  if (formula.includes("*")) return "crit";

  // Foundry advantage/disadvantage:
  // 2d20kh, 2d20kh1, 2d20kl, 2d20kl1
  // qualquer 2d20 vira duas rolagens separadas
  if (/2d20/i.test(formula)) {

    const mod = extractModifier(
      formula
        .replace(/2d20k[hl]1?/gi, "")
        .replace(/2d20/gi, "")
    );

    return `d20${mod}/d20${mod}`;
  }

  if (!formula.match(/\d*d\d+/i)) return "nodice";

  return addMods(formula);
}

function extractModifier(formula) {

  const matches = formula.match(/([+-]\d+)(?!d)/g);

  if (!matches) return "";

  const total = matches.reduce((a, b) => a + parseInt(b), 0);

  if (total === 0) return "";

  return total > 0 ? `+${total}` : `${total}`;
}

function addMods(formula) {

  formula = formula.replace(/[,]/g, "+");
  formula = formula.replace(/[{} ]/g, "");

  const dice = Array.from(
    formula.matchAll(/(\d*d\d+)/gi),
    i => i[0]
  ).map(die => die.replace(/^1(?=d)/i, ""));

  const mods = Array.from(
    formula.matchAll(/([+-]\d+)(?!d)/gi),
    i => i[0]
  ).reduce((a, b) => a + parseInt(b), 0);

  if (!dice.length) return "nodice";

  if (mods === 0) return dice.join("+");

  return dice.join("+") + (mods > 0 ? "+" : "") + mods;
}