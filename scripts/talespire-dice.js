Hooks.once("ready", () => {
  console.log("talespire-dice | Initializing talespire-dice");
  if (!(game.modules.has("betterrolls5e") && game.modules.get("betterrolls5e").active)) {
    Hooks.on("preCreateChatMessage", (msg, data, options, userId) => {
      const roll = (msg.rolls && msg.rolls.length > 0) ? msg.rolls[0] : null;
      if (!roll) return;

      const flavorText = msg.flavor || roll.options?.flavor || "";
      const flavor = flavorText ? parseFlavorText(flavorText) : "dice";
      const formula = parseRollFormula(roll.formula);

      if (formula === "crit") {
        ui.notifications.error("Talespire currently doesn't support multiplication to calculate critical hits. Please roll damage normally then double it.");
      } else if (formula === "nodice") {
        console.log("talespire-dice | No dice roll found.");
      } else {
        openTalespireUrl("talespire://dice/" + flavor + ":" + formula);
      }
      return false;
    });
  }
  else {
    ui.notifications.error("Talespire Dice Relay is not compatible with BetterRolls5e.");
  }
});

function parseFlavorText(flavor) {
  if (flavor.indexOf("<") > -1) {
    flavor = flavor.match(/>(.+?)</)[1];
    flavor = flavor.replace(/:/g, "");
  }
  return encodeURI(flavor);
}

function parseRollFormula(formula) {
  if (formula.indexOf("*") > -1) {
    return "crit";
  }
  if (!formula.match(/\d*d\d+/)) {
    return "nodice";
  }
  if (formula.indexOf("2d20k") > -1) {
    formula = formula.replace(/^2/, "1");
    formula = addMods(formula);
    return formula + "/" + formula;
  }
  return addMods(formula);
}

function addMods(formula) {
  formula = formula.replace(/[,]/g, "+");
  formula = formula.replace(/[{} ]/g, "");
  const dice = Array.from(formula.matchAll(/(\d*d\d+)/g), i => i[0]);
  const mods = Array.from(formula.matchAll(/([+-]\d+)(?!d)/g), i => i[0]).reduce((a, b) => a + parseInt(b), 0);
  return dice.join("+") + (mods >= 0 ? "+" : "") + mods;
}

function openTalespireUrl(url) {
  location.href = url;
}

