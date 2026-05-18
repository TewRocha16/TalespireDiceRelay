Hooks.once("ready", () => {

  console.log("talespire-dice | Initializing talespire-dice");

  if (game.modules.has("betterrolls5e") && game.modules.get("betterrolls5e")?.active) {
    ui.notifications.error("Talespire Dice Relay is not compatible with BetterRolls5e.");
    return;
  }

  Hooks.on("preCreateChatMessage", (msg, data) => {

    const rollData = data.rolls?.[0];

    if (!rollData) return;

    const formula = parseRollFormula(rollData.formula);

    if (formula === "crit") {
      ui.notifications.error(
        "Talespire doesn't support critical multiplication formulas."
      );
      return false;
    }

    if (formula === "nodice") {
      return;
    }

    openTalespireUrl("talespire://dice/" + formula);

    // impede a criação da mensagem no foundry
    return false;

  });

});

function parseRollFormula(formula) {

  if (!formula) {
    return "nodice";
  }

  formula = formula.replace(/\s+/g, "");

  // Talespire não suporta multiplicação
  if (formula.includes("*")) {
    return "crit";
  }

  // vantagem
  if (formula.match(/2d20kh/i)) {

    const mod = extractModifier(formula);

    return `d20${mod}/d20${mod}`;
  }

  // desvantagem
  if (formula.match(/2d20kl/i)) {

    const mod = extractModifier(formula);

    return `d20${mod}/d20${mod}`;
  }

  // nenhum dado encontrado
  if (!formula.match(/\d*d\d+/i)) {
    return "nodice";
  }

  return addMods(formula);
}

function extractModifier(formula) {

  const modMatch = formula.match(/([+-]\d+)/g);

  if (!modMatch) {
    return "";
  }

  const total = modMatch.reduce((a, b) => a + parseInt(b), 0);

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

function openTalespireUrl(url) {
  location.href = url;
}