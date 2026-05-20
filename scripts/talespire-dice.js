Hooks.once("ready", () => {

  console.log("talespire-dice | Initialized");

  Hooks.on("createChatMessage", (msg) => {

    const roll = msg.rolls?.[0];

    if (!roll) return;

    const formulas = parseRollFormula(roll.formula);

    if (formulas === "nodice") return;

    if (formulas === "crit") {
      ui.notifications.error("Talespire doesn't support multiplication crit formulas.");
      return;
    }

    console.log("talespire-dice | Foundry formula:", roll.formula);
    console.log("talespire-dice | TaleSpire formulas:", formulas);

    formulas.forEach((formula, index) => {
      setTimeout(() => {
        location.href = "talespire://dice/" + formula;
      }, index * 300);
    });

  });

});

function parseRollFormula(formula) {

  if (!formula) return "nodice";

  formula = formula.replace(/\s+/g, "");

  if (formula.includes("*")) return "crit";

  // Vantagem/desvantagem Foundry: 2d20kh / 2d20kl
  // TaleSpire: duas chamadas separadas
  if (/2d20k[hl]/i.test(formula)) {
    const singleRoll = convertD20AdvantageToSingleRoll(formula);
    return [singleRoll, singleRoll];
  }

  if (!formula.match(/\d*d\d+/i)) return "nodice";

  return [addMods(formula)];
}

function convertD20AdvantageToSingleRoll(formula) {

  const withoutAdvantageDice = formula.replace(/2d20k[hl]/gi, "");

  const mod = extractModifier(withoutAdvantageDice);

  return `d20${mod}`;
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