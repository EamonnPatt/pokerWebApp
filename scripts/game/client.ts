export {};
import { io } from "socket.io-client";
import { Card, GameState } from "holdem-poker";

const socket = io();

let mySeat: number | null = null;
const tableDiv = document.getElementById("table")!;
const controls = document.querySelectorAll<HTMLButtonElement>("button.action");


function formatCard(card: Card): string {
    const value = card.value <= 10 ? String(card.value)
                : ["J", "Q", "K", "A"][card.value - 11];
  
    const suitMap: Record<string | number, string> = {
      SPADE: "♠", HEART: "♥", DIAMOND: "♦", CLUB: "♣",
      0: "♠", 1: "♥", 2: "♦", 3: "♣",
    };
  
    return `<span class="border rounded px-1 bg-white text-black">
              ${value}${suitMap[card.suit]}
            </span>`;
  }
function updateControls(state: GameState) {
  if (mySeat === null) return;
  const available = state.players[mySeat].availableActions;

  controls.forEach((btn) => {
    btn.classList.toggle("hidden", !available.includes(btn.dataset.move!));
  });
}

socket.on("hello", () => {
  socket.emit("sit");
});

socket.on("seated", (idx: number) => {
  mySeat = idx;
  console.log("You are seated at", idx);
});

socket.on("state", (state: GameState) => {
  render(state);
  updateControls(state);
});

socket.on("result", (result) => {
  alert(result.type === "win"
    ? `Player ${result.index! + 1} wins: ${result.name}`
    : "Split pot");
});

socket.on("errorMsg", (msg: string) => alert(msg));

// ────────────────────────────────────────────────────────────────────────────
// UI helpers
export function render(state: GameState) {
  tableDiv.innerHTML = `
    <div class="text-center">
      <div>Pot: <strong>${state.pot}</strong></div>
      <div class="flex gap-2 justify-center my-4">
        ${state.communityCards.map(formatCard).join("")}
      </div>
    </div>

    <div class="flex gap-8 justify-center">
      ${state.players
        .map((p, i) => {
          const you = i === mySeat ? " (You)" : "";
          return `
          <div class="bg-emerald-800 p-4 rounded w-48">
            <h3 class="font-bold mb-2">
              Player ${i + 1}${you}
              ${p.folded ? " - Folded" : ""}
            </h3>
            <div>Stack: ${p.money}</div>
            <div>Bet: ${p.currentBet}</div>
            <div class="mt-2 flex gap-1">${p.hand.map(formatCard).join("")}</div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────────────────
// Buttons → socket actions
controls.forEach((btn) =>
  btn.addEventListener("click", () => {
    const move = btn.dataset.move!;
    if (move === "raise") {
      const amt = Number(prompt("Raise amount?", "20"));
      if (Number.isNaN(amt)) return;
      socket.emit("action", { move, amount: amt });
    } else {
      socket.emit("action", { move });
    }
  }),
);

