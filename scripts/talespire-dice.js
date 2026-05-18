Hooks.once("ready", () => {

  console.log("talespire-dice | Initializing talespire-dice");

  if (game.modules.has("betterrolls5e") && game.modules.get("betterrolls5e")?.active) {
    ui.notifications.error("Talespire Dice Relay is not compatible with BetterRolls5e.");
    return;
  }

  Hooks.on("createChatMessage", async (msg) => {

    const roll = msg.rolls?.[0];

    if (!roll) return;

    const formula = parseRollFormula(roll.formula);

    if (formula === "crit") {
      ui.notifications.error(
        "Talespire doesn't support critical multiplication formulas."
      );
      return;
    }

    if (formula === "nodice") {
      return;
    }

    openTalespireUrl("talespire://dice/" + formula);

    // remove a mensagem do foundry
    await msg.delete();

  });

});

function parseRollFormula(formula) {

  if (!formula) {
    return "nodice";
  }

  // Talespire não suporta multiplicação
  if (formula.includes("*")) {
    return "crit";
  }

  // Nenhum dado encontrado
  if (!formula.match(/\d*d\d+/i)) {
    return "nodice";
  }

  // vantagem/desvantagem
  if (formula.includes("2d20k")) {

    formula = formula.replace(/^2/, "1");

    formula = addMods(formula);

    return formula + "/" + formula;
  }

  return addMods(formula);
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

function openTalespireUrl(url) {
  location.href = url;
}