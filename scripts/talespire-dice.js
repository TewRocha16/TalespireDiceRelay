Hooks.once("ready", () => {

  console.log("talespire-dice | Initialized");

  Hooks.on("createChatMessage", async (msg) => {

    const roll = msg.rolls?.[0];

    if (!roll) return;

    const formula = parseRollFormula(roll.formula);

    if (formula === "nodice") return;

    if (formula === "crit") {
      ui.notifications.error(
        "Talespire doesn't support multiplication crit formulas."
      );
      return;
    }

    location.href = "talespire://dice/" + formula;

    try {
      await msg.delete();
    }
    catch (err) {
      console.error(err);
    }

  });

});

function parseRollFormula(formula) {

  if (!formula) {
    return "nodice";
  }

  formula = formula.replace(/\s+/g, "");

  // vantagem
  if (/2d20kh/i.test(formula)) {

    const mod = extractModifier(formula);

    return `d20${mod}/d20${mod}`;
  }

  // desvantagem
  if (/2d20kl/i.test(formula)) {

    const mod = extractModifier(formula);

    return `d20${mod}/d20${mod}`;
  }

  // crit
  if (formula.includes("*")) {
    return "crit";
  }

  return addMods(formula);
}

function extractModifier(formula) {

  const matches = formula.match(/([+-]\d+)/g);

  if (!matches) return "";

  const total = matches.reduce((a, b) => a + parseInt(b), 0);

  return total >= 0 ? `+${total}` : `${total}`;
}

function addMods(formula) {

  formula = formula.replace(/[,]/g, "+");
  formula = formula.replace(/[{} ]/g, "");

  const dice = Array.from(
    formula.matchAll(/(\d*d\d+)/gi),
    i => i[0]
  );

  const mods = Array.from(
    formula.matchAll(/([+-]\d+)(?!d)/gi),
    i => i[0]
  ).reduce((a, b) => a + parseInt(b), 0);

  return dice.join("+") + (mods >= 0 ? "+" : "") + mods;
}