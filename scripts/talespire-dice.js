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

    openTalespireUrl("talespire://dice/" + formula);

    // remove imediatamente a mensagem do foundry
    try {
      await msg.delete();
    }
    catch(err) {
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

  // crítico
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

function openTalespireUrl(url) {

  const iframe = document.createElement("iframe");

  iframe.style.display = "none";
  iframe.src = url;

  document.body.appendChild(iframe);

  setTimeout(() => {
    iframe.remove();
  }, 1000);
}